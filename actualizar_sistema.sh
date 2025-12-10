#!/bin/bash

###############################################################################
# Script de Actualización del Sistema ITSM
# Nuevas Funcionalidades:
# 1. Reportes PDF completos con TODOS los datos
# 2. Campo SELECT para tipo de equipo con campos dinámicos
# 3. Fecha de revisión en bitácoras
# 4. Historial de bitácoras por equipo y empresa
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Actualización del Sistema ITSM - Nuevas Funcionalidades${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

INSTALL_DIR="/opt/itsm"

if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Error: No se encuentra instalación en ${INSTALL_DIR}${NC}"
    exit 1
fi

# 1. Hacer backup
echo -e "${BLUE}[1/5] Creando backup...${NC}"
BACKUP_DIR="/opt/itsm_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$INSTALL_DIR" "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup creado: ${BACKUP_DIR}${NC}"

# 2. Detener servicios
echo -e "${BLUE}[2/5] Deteniendo servicios...${NC}"
systemctl stop itsm-backend itsm-frontend

# 3. Actualizar código desde GitHub
echo -e "${BLUE}[3/5] Actualizando código...${NC}"
cd "$INSTALL_DIR"
git pull origin main || echo "No hay cambios en Git, continuando..."

# 4. Actualizar dependencias si es necesario
echo -e "${BLUE}[4/5] Verificando dependencias...${NC}"
cd "$INSTALL_DIR/backend"
pip3 install --break-system-packages --upgrade motor pymongo fpdf2 --quiet

cd "$INSTALL_DIR/frontend"
yarn install --silent

# 5. Reiniciar servicios
echo -e "${BLUE}[5/5] Reiniciando servicios...${NC}"
systemctl start itsm-backend
sleep 5
systemctl start itsm-frontend
sleep 5

# Verificar estado
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Verificando servicios...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if systemctl is-active --quiet itsm-backend; then
    echo -e "${GREEN}✓ Backend activo${NC}"
else
    echo -e "${YELLOW}⚠ Backend no respondió${NC}"
fi

if systemctl is-active --quiet itsm-frontend; then
    echo -e "${GREEN}✓ Frontend activo${NC}"
else
    echo -e "${YELLOW}⚠ Frontend no respondió${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ¡Actualización Completada con Éxito!              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Nuevas funcionalidades disponibles:${NC}"
echo -e "${GREEN}✓${NC} Reportes PDF completos con TODOS los datos del equipo y bitácora"
echo -e "${GREEN}✓${NC} Campo SELECT para tipo de equipo"
echo -e "${GREEN}✓${NC} Campos dinámicos según tipo de equipo seleccionado"
echo -e "${GREEN}✓${NC} Fecha de revisión en bitácoras"
echo -e "${GREEN}✓${NC} Historial de bitácoras por equipo (botón azul con reloj)"
echo -e "${GREEN}✓${NC} Filtrado de bitácoras por empresa"
echo ""
echo -e "${BLUE}Accede a:${NC} http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo -e "${YELLOW}Si hay problemas, restaura el backup:${NC}"
echo -e "  sudo rm -rf ${INSTALL_DIR}"
echo -e "  sudo mv ${BACKUP_DIR} ${INSTALL_DIR}"
echo -e "  sudo systemctl restart itsm-backend itsm-frontend"
echo ""
