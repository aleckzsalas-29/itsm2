#!/bin/bash
# Script para aplicar todos los cambios manualmente en el servidor

echo "📦 Aplicando cambios del Sistema ITSM..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /opt/itsm || exit 1

echo -e "${YELLOW}Paso 1: Crear backups...${NC}"
cp backend/server.py backend/server.py.backup.$(date +%Y%m%d_%H%M%S)
cp backend/database.py backend/database.py.backup.$(date +%Y%m%d_%H%M%S)
cp frontend/src/pages/Bitacoras.jsx frontend/src/pages/Bitacoras.jsx.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Backups creados${NC}"
echo ""

echo -e "${YELLOW}Paso 2: Actualizando database.py...${NC}"
cat > backend/database.py << 'EOF'
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

async def init_db():
    await db.usuarios.create_index("email", unique=True)
    await db.empresas.create_index("nombre")
    await db.equipos.create_index("empresa_id")
    await db.bitacoras.create_index([("empresa_id", 1), ("fecha", -1)])
    await db.servicios.create_index("empresa_id")
    print("Database indexes created")
EOF
echo -e "${GREEN}✅ database.py actualizado${NC}"
echo ""

echo -e "${YELLOW}Paso 3: Instalando python-dotenv...${NC}"
cd backend
source venv/bin/activate
pip install python-dotenv > /dev/null 2>&1
deactivate
cd ..
echo -e "${GREEN}✅ python-dotenv instalado${NC}"
echo ""

echo -e "${YELLOW}Paso 4: Reiniciando servicios...${NC}"
sudo systemctl restart itsm-backend
sleep 5
sudo systemctl restart itsm-frontend
sleep 5
echo -e "${GREEN}✅ Servicios reiniciados${NC}"
echo ""

echo -e "${YELLOW}Paso 5: Verificando...${NC}"
if curl -s http://localhost:8000/api/ | grep -q "Sistema ITSM API"; then
    echo -e "${GREEN}✅ Backend funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error en backend - revisar logs:${NC}"
    echo "sudo journalctl -u itsm-backend -n 50"
    exit 1
fi

if curl -s http://localhost:3000 | grep -q "html"; then
    echo -e "${GREEN}✅ Frontend funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error en frontend - revisar logs:${NC}"
    echo "sudo journalctl -u itsm-frontend -n 50"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ¡Actualización completa!${NC}"
echo ""
echo "Ahora necesitas agregar manualmente los 3 endpoints en server.py"
echo "Sigue las instrucciones en: PASOS_ACTUALIZACION_GITHUB.md"
echo ""
echo "O descarga el proyecto completo desde Emergent y haz:"
echo "  git pull origin master"
