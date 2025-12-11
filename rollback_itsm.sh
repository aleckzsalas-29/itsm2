#!/bin/bash

##############################################
# Script de Rollback - Sistema ITSM
# Versión: 1.0
# Fecha: Diciembre 2024
##############################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
ITSM_DIR="/opt/itsm"
BACKUP_DIR="/opt/itsm_backups"
BACKUP_NAME=$1

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

# Banner
clear
echo -e "${RED}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║   Sistema ITSM - Script de Rollback      ║
║        ⚠️  RESTAURAR VERSIÓN ANTERIOR     ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar parámetro
if [ -z "$BACKUP_NAME" ]; then
    error "Debes especificar el nombre del backup"
    echo ""
    echo "Uso: bash rollback_itsm.sh <nombre_backup>"
    echo ""
    echo "Backups disponibles:"
    ls -lth "$BACKUP_DIR" | grep backup_ | head -10
    exit 1
fi

# Verificar que existe el backup
if [ ! -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    error "El backup '$BACKUP_NAME' no existe"
    echo ""
    echo "Backups disponibles:"
    ls -lth "$BACKUP_DIR" | grep backup_
    exit 1
fi

# Confirmación
echo ""
warning "ADVERTENCIA: Esta acción restaurará el sistema al estado del backup:"
echo "  $BACKUP_DIR/$BACKUP_NAME"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    log "Rollback cancelado por el usuario"
    exit 0
fi

log "Iniciando rollback..."
echo ""

# 1. Detener servicios
log "Deteniendo servicios..."
systemctl stop itsm-frontend
systemctl stop itsm-backend
sleep 2
log "✓ Servicios detenidos"

# 2. Crear backup del estado actual (por seguridad)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_BACKUP="$BACKUP_DIR/pre_rollback_${TIMESTAMP}"
log "Creando backup de seguridad del estado actual..."
rsync -av --exclude 'node_modules' "$ITSM_DIR/" "$SAFETY_BACKUP/" > /dev/null 2>&1
log "✓ Backup de seguridad creado en: $SAFETY_BACKUP"

# 3. Restaurar archivos
log "Restaurando archivos desde backup..."
rsync -av --delete \
      --exclude 'node_modules' \
      --exclude '.git' \
      "$BACKUP_DIR/$BACKUP_NAME/" "$ITSM_DIR/" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log "✓ Archivos restaurados"
else
    error "Error al restaurar archivos"
    exit 1
fi

# 4. Restaurar base de datos (si existe)
if [ -d "$BACKUP_DIR/$BACKUP_NAME/mongodb_backup" ]; then
    log "Restaurando base de datos MongoDB..."
    mongorestore --db itsm_database --drop "$BACKUP_DIR/$BACKUP_NAME/mongodb_backup/itsm_database" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log "✓ Base de datos restaurada"
    else
        warning "No se pudo restaurar la base de datos"
    fi
else
    warning "No se encontró backup de la base de datos"
fi

# 5. Reinstalar dependencias
log "Reinstalando dependencias..."
cd "$ITSM_DIR/backend"
pip3 install -r requirements.txt > /dev/null 2>&1
cd "$ITSM_DIR/frontend"
yarn install > /dev/null 2>&1
log "✓ Dependencias reinstaladas"

# 6. Reiniciar servicios
log "Reiniciando servicios..."
systemctl start itsm-backend
sleep 3
systemctl start itsm-frontend
sleep 5

# 7. Verificar
if systemctl is-active --quiet itsm-backend && systemctl is-active --quiet itsm-frontend; then
    log "✓ Servicios corriendo correctamente"
else
    error "Algunos servicios no están corriendo"
fi

echo ""
log "╔═══════════════════════════════════════════╗"
log "║     ROLLBACK COMPLETADO EXITOSAMENTE      ║"
log "╚═══════════════════════════════════════════╝"
echo ""
log "Sistema restaurado a la versión del backup: $BACKUP_NAME"
log "Backup de seguridad guardado en: $SAFETY_BACKUP"
echo ""
