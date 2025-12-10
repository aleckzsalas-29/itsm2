#!/bin/bash

###############################################################################
# Script de Instalación Automática - Sistema ITSM
# Versión: 2.0
# Uso: sudo bash instalar.sh
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Sistema ITSM - Instalación Automática           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: Ejecuta como root (sudo)${NC}"
    exit 1
fi

INSTALL_DIR="/opt/itsm"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}Directorio de instalación: ${GREEN}${INSTALL_DIR}${NC}"
echo -e "${YELLOW}Código fuente: ${GREEN}${SOURCE_DIR}${NC}"
echo ""

# Backup si existe
if [ -d "$INSTALL_DIR" ]; then
    BACKUP_DIR="/opt/itsm_backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}⚠️  Instalación existente detectada${NC}"
    read -p "¿Crear backup y continuar? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cp -r "$INSTALL_DIR" "$BACKUP_DIR"
        echo -e "${GREEN}✓ Backup: ${BACKUP_DIR}${NC}"
        rm -rf "$INSTALL_DIR"
    else
        echo -e "${RED}Instalación cancelada${NC}"
        exit 0
    fi
fi

# 1. Instalar Node.js y Yarn
echo -e "${BLUE}[1/8] Instalando Node.js y Yarn...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
if ! command -v yarn &> /dev/null; then
    npm install -g yarn
fi
echo -e "${GREEN}✓ Node $(node --version) y Yarn $(yarn --version)${NC}"

# 2. Instalar Python
echo -e "${BLUE}[2/8] Instalando Python...${NC}"
apt-get install -y python3 python3-pip python3-venv
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# 3. Instalar MongoDB
echo -e "${BLUE}[3/8] Instalando MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
      gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
    
    echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] \
https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
      tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    apt-get update -qq
    apt-get install -y mongodb-org
fi

systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}✓ MongoDB instalado e iniciado${NC}"

# 4. Copiar código
echo -e "${BLUE}[4/8] Copiando código...${NC}"
mkdir -p "$INSTALL_DIR"
cp -r "$SOURCE_DIR"/* "$INSTALL_DIR"/
echo -e "${GREEN}✓ Código copiado${NC}"

# 5. Configurar Backend
echo -e "${BLUE}[5/8] Configurando Backend...${NC}"
cd "$INSTALL_DIR/backend"

# Crear .env
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="itsm_database"
CORS_ORIGINS="*"
SECRET_KEY="$(openssl rand -hex 32)"
EOF

# Instalar dependencias
pip3 install --no-cache-dir -r requirements.txt
echo -e "${GREEN}✓ Backend configurado${NC}"

# 6. Configurar Frontend
echo -e "${BLUE}[6/8] Configurando Frontend...${NC}"
cd "$INSTALL_DIR/frontend"

# Crear .env
cat > .env << EOF
REACT_APP_BACKEND_URL="http://localhost:8001"
EOF

# Instalar dependencias
yarn install
echo -e "${GREEN}✓ Frontend configurado${NC}"

# 7. Crear servicios systemd
echo -e "${BLUE}[7/8] Creando servicios...${NC}"

cat > /etc/systemd/system/itsm-backend.service << EOF
[Unit]
Description=ITSM Backend FastAPI Service
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/itsm-frontend.service << EOF
[Unit]
Description=ITSM Frontend React App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/frontend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo -e "${GREEN}✓ Servicios creados${NC}"

# 8. Inicializar BD
echo -e "${BLUE}[8/8] Inicializando base de datos...${NC}"
cd "$INSTALL_DIR/backend"
python3 << 'PYEOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

async def init_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["itsm_database"]
    existing = await db.usuarios.find_one({"email": "admin@itsm.com"})
    if not existing:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        admin = {
            "email": "admin@itsm.com",
            "nombre": "Administrador",
            "password_hash": pwd_context.hash("admin123"),
            "rol": "Administrador",
            "activo": True,
            "fecha_creacion": datetime.now()
        }
        await db.usuarios.insert_one(admin)
        print("✓ Usuario admin creado")
    else:
        print("✓ Usuario admin ya existe")
    client.close()

asyncio.run(init_db())
PYEOF
echo -e "${GREEN}✓ Base de datos inicializada${NC}"

# Iniciar servicios
echo ""
echo -e "${BLUE}Iniciando servicios...${NC}"
systemctl start itsm-backend
systemctl enable itsm-backend
sleep 3

systemctl start itsm-frontend
systemctl enable itsm-frontend
sleep 3

# Verificar
echo ""
if systemctl is-active --quiet itsm-backend; then
    echo -e "${GREEN}✓ Backend corriendo${NC}"
else
    echo -e "${RED}✗ Backend falló${NC}"
fi

if systemctl is-active --quiet itsm-frontend; then
    echo -e "${GREEN}✓ Frontend corriendo${NC}"
else
    echo -e "${RED}✗ Frontend falló${NC}"
fi

# Resumen final
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ¡Instalación Completada con Éxito!             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Acceso:${NC}"
echo -e "   Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:   ${GREEN}http://localhost:8001/docs${NC}"
echo ""
echo -e "${BLUE}👤 Credenciales:${NC}"
echo -e "   Email:     ${GREEN}admin@itsm.com${NC}"
echo -e "   Password:  ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo -e "   Ver logs backend:  ${YELLOW}journalctl -u itsm-backend -f${NC}"
echo -e "   Ver logs frontend: ${YELLOW}journalctl -u itsm-frontend -f${NC}"
echo -e "   Reiniciar:         ${YELLOW}systemctl restart itsm-backend itsm-frontend${NC}"
echo ""
