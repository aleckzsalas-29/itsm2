#!/bin/bash

##############################################
# Script de Actualización - Sistema ITSM
# Versión: 2.0
# Fecha: Diciembre 2024
##############################################

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Variables
ITSM_DIR="/opt/itsm"
BACKUP_DIR="/opt/itsm_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"
LOG_FILE="/var/log/itsm_actualizacion_${TIMESTAMP}.log"

# Funciones
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║   Sistema ITSM - Script de Actualización  ║
║              Versión 2.0                  ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando script de actualización..."

# 1. VERIFICACIONES PRE-ACTUALIZACIÓN
section "1. VERIFICACIONES PREVIAS"

# Verificar que estamos en root o sudo
if [ "$EUID" -ne 0 ]; then 
    error "Este script debe ejecutarse como root o con sudo"
    exit 1
fi
log "✓ Ejecutando como root"

# Verificar que existe el directorio ITSM
if [ ! -d "$ITSM_DIR" ]; then
    error "No se encontró el directorio $ITSM_DIR"
    exit 1
fi
log "✓ Directorio ITSM encontrado"

# Verificar servicios
if ! systemctl is-active --quiet itsm-backend; then
    warning "El servicio itsm-backend no está corriendo"
else
    log "✓ Servicio backend corriendo"
fi

if ! systemctl is-active --quiet itsm-frontend; then
    warning "El servicio itsm-frontend no está corriendo"
else
    log "✓ Servicio frontend corriendo"
fi

# Verificar conexión a internet
if ! ping -c 1 github.com &> /dev/null; then
    error "No hay conexión a internet"
    exit 1
fi
log "✓ Conexión a internet disponible"

# Verificar git
cd "$ITSM_DIR" || exit 1
if [ ! -d ".git" ]; then
    error "No es un repositorio Git"
    exit 1
fi
log "✓ Repositorio Git válido"

# 2. CREAR BACKUP
section "2. CREANDO BACKUP"

mkdir -p "$BACKUP_DIR"
log "Creando backup en: $BACKUP_DIR/$BACKUP_NAME"

# Backup completo del directorio
rsync -av --exclude 'node_modules' \
          --exclude '.git' \
          --exclude '__pycache__' \
          --exclude '*.pyc' \
          --exclude 'build' \
          "$ITSM_DIR/" "$BACKUP_DIR/$BACKUP_NAME/" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "✓ Backup creado exitosamente"
    log "  Ubicación: $BACKUP_DIR/$BACKUP_NAME"
else
    error "Falló la creación del backup"
    exit 1
fi

# Backup de base de datos MongoDB
info "Creando backup de base de datos..."
mongodump --db itsm_database --out "$BACKUP_DIR/$BACKUP_NAME/mongodb_backup" >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    log "✓ Backup de MongoDB creado"
else
    warning "No se pudo crear backup de MongoDB (puede no estar instalado localmente)"
fi

# 3. DETENER SERVICIOS
section "3. DETENIENDO SERVICIOS"

log "Deteniendo servicios..."
systemctl stop itsm-frontend
systemctl stop itsm-backend
sleep 2
log "✓ Servicios detenidos"

# 4. ACTUALIZAR CÓDIGO
section "4. ACTUALIZANDO CÓDIGO"

cd "$ITSM_DIR" || exit 1

# Verificar cambios locales
if ! git diff-index --quiet HEAD --; then
    warning "Hay cambios locales sin commitear"
    info "Guardando cambios locales en stash..."
    git stash save "Auto-stash antes de actualización ${TIMESTAMP}" >> "$LOG_FILE" 2>&1
fi

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
log "Rama actual: $CURRENT_BRANCH"

# Actualizar desde remoto
log "Descargando últimos cambios desde GitHub..."
if git fetch origin >> "$LOG_FILE" 2>&1; then
    log "✓ Cambios descargados"
else
    error "Falló la descarga de cambios"
    section "INICIANDO ROLLBACK"
    systemctl start itsm-backend
    systemctl start itsm-frontend
    exit 1
fi

# Aplicar cambios
log "Aplicando cambios..."
if git pull origin "$CURRENT_BRANCH" >> "$LOG_FILE" 2>&1; then
    log "✓ Código actualizado exitosamente"
else
    error "Falló la actualización del código"
    section "INICIANDO ROLLBACK"
    git reset --hard HEAD
    systemctl start itsm-backend
    systemctl start itsm-frontend
    exit 1
fi

# 5. ACTUALIZAR DEPENDENCIAS
section "5. ACTUALIZANDO DEPENDENCIAS"

# Backend (Python)
log "Actualizando dependencias de Python..."
cd "$ITSM_DIR/backend" || exit 1
if pip3 install -r requirements.txt >> "$LOG_FILE" 2>&1; then
    log "✓ Dependencias de Python actualizadas"
else
    warning "Algunas dependencias de Python pueden no haberse actualizado"
fi

# Frontend (Node/Yarn)
log "Actualizando dependencias de Node..."
cd "$ITSM_DIR/frontend" || exit 1
if yarn install >> "$LOG_FILE" 2>&1; then
    log "✓ Dependencias de Node actualizadas"
else
    warning "Algunas dependencias de Node pueden no haberse actualizado"
fi

# Verificar fuentes DejaVu (para PDFs)
if [ ! -f "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" ]; then
    warning "Fuentes DejaVu no instaladas (necesarias para PDFs)"
    info "Instalando fuentes DejaVu..."
    apt-get update >> "$LOG_FILE" 2>&1
    apt-get install -y fonts-dejavu fonts-dejavu-core >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✓ Fuentes DejaVu instaladas"
    else
        warning "No se pudieron instalar las fuentes DejaVu"
    fi
fi

# 6. REINICIAR SERVICIOS
section "6. REINICIANDO SERVICIOS"

log "Iniciando servicios..."
systemctl start itsm-backend
sleep 3
systemctl start itsm-frontend
sleep 5

# 7. VERIFICACIONES POST-ACTUALIZACIÓN
section "7. VERIFICACIONES POST-ACTUALIZACIÓN"

# Verificar que los servicios estén corriendo
if systemctl is-active --quiet itsm-backend; then
    log "✓ Backend corriendo"
else
    error "Backend no está corriendo"
    systemctl status itsm-backend --no-pager
    exit 1
fi

if systemctl is-active --quiet itsm-frontend; then
    log "✓ Frontend corriendo"
else
    error "Frontend no está corriendo"
    systemctl status itsm-frontend --no-pager
    exit 1
fi

# Verificar logs del backend
log "Verificando logs del backend..."
if journalctl -u itsm-backend -n 20 --no-pager | grep -qi "error\|traceback\|exception"; then
    warning "Se detectaron errores en los logs del backend"
    info "Revisar: journalctl -u itsm-backend -n 50"
else
    log "✓ Backend sin errores críticos"
fi

# Verificar logs del frontend
log "Verificando logs del frontend..."
if journalctl -u itsm-frontend -n 20 --no-pager | grep -qi "failed\|error"; then
    warning "Se detectaron errores en los logs del frontend"
    info "Revisar: journalctl -u itsm-frontend -n 50"
else
    log "✓ Frontend sin errores críticos"
fi

# Test de conectividad
log "Probando conectividad..."
sleep 3
if curl -s -f http://localhost:8001/api/health > /dev/null 2>&1 || curl -s http://localhost:8001/api > /dev/null 2>&1; then
    log "✓ Backend respondiendo correctamente"
else
    warning "Backend puede no estar respondiendo correctamente"
fi

if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    log "✓ Frontend respondiendo correctamente"
else
    warning "Frontend puede no estar respondiendo correctamente"
fi

# 8. RESUMEN FINAL
section "8. RESUMEN DE ACTUALIZACIÓN"

echo ""
log "╔═══════════════════════════════════════════╗"
log "║   ACTUALIZACIÓN COMPLETADA EXITOSAMENTE   ║"
log "╚═══════════════════════════════════════════╝"
echo ""

log "📦 Backup creado en:"
log "   $BACKUP_DIR/$BACKUP_NAME"
echo ""

log "📝 Cambios aplicados:"
git log --oneline -5 | while read line; do
    log "   • $line"
done
echo ""

log "🔧 Servicios:"
log "   • Backend: $(systemctl is-active itsm-backend)"
log "   • Frontend: $(systemctl is-active itsm-frontend)"
echo ""

log "🌐 URLs:"
log "   • Frontend: http://$(hostname -I | awk '{print $1}'):3000"
log "   • Backend:  http://$(hostname -I | awk '{print $1}'):8001/api"
echo ""

log "✨ Nuevas Funcionalidades Incluidas:"
log "   1. Ver Historial de Equipos (botón azul en equipos)"
log "   2. Reportes PDF Mejorados (3 plantillas: Moderna, Clásica, Minimalista)"
log "   3. Campos Dinámicos por Tipo (12 tipos de equipos con campos específicos)"
log "   4. Fecha de Revisión en Bitácoras (programación de seguimientos)"
log "   5. Campos Optimizados en Equipos (8 nuevos campos únicos)"
echo ""

log "📋 Log completo guardado en: $LOG_FILE"
echo ""

info "PRÓXIMOS PASOS:"
info "1. Verificar la aplicación en el navegador: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
info "2. Probar nuevas funcionalidades:"
info "   ✓ Equipos: Ver botón historial (azul) + nuevos campos (Fecha Compra, Garantía, MAC, IP, etc.)"
info "   ✓ Reportes: Selector de plantillas PDF (Moderna/Clásica/Minimalista)"
info "   ✓ Equipos: Campos dinámicos al seleccionar tipo (Laptop, Servidor, etc.)"
info "   ✓ Bitácoras: Campo Fecha de Revisión + columna en tabla"
echo ""
info "3. Si hay problemas:"
info "   • Revisar logs: sudo journalctl -u itsm-backend -n 50"
info "   • Ejecutar rollback: bash rollback_itsm.sh $BACKUP_NAME"
echo ""

log "✅ Actualización finalizada: $(date)"
