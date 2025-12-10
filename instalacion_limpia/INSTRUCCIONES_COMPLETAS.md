# 📚 Guía Completa de Instalación - Sistema ITSM

## 🎯 Opciones de Instalación

### Opción 1: Instalación Directa desde Emergent (RECOMENDADO)

El código completo ya está en este repositorio en `/app/`. Puedes:

1. **Conectar tu servidor a Emergent** y hacer deploy directo
2. **Descargar todo el repositorio** desde Emergent y subirlo a tu servidor
3. **Usar Git** para clonar desde Emergent a tu servidor

### Opción 2: Instalación Manual

Sigue estos pasos si quieres instalar manualmente.

---

## 📋 Requisitos Previos

### Hardware Mínimo
- CPU: 2 cores
- RAM: 2 GB
- Disco: 10 GB disponibles

### Software Requerido
- Ubuntu 20.04 o superior
- Acceso root o sudo

---

## 🚀 Instalación Paso a Paso

### PASO 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar dependencias básicas
sudo apt-get install -y curl wget git build-essential
```

### PASO 2: Instalar Node.js y Yarn

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Instalar Yarn
sudo npm install -g yarn

# Verificar instalación
node --version  # Debe mostrar v20.x
yarn --version  # Debe mostrar 1.22.x
```

### PASO 3: Instalar Python 3

```bash
# Instalar Python y pip
sudo apt-get install -y python3 python3-pip python3-venv

# Verificar instalación
python3 --version  # Debe mostrar 3.8 o superior
```

### PASO 4: Instalar MongoDB

```bash
# Agregar repositorio de MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] \
https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar que está corriendo
sudo systemctl status mongod
```

### PASO 5: Obtener el Código

**Opción A: Desde Git (si tienes el repo en GitHub)**
```bash
cd /opt
sudo git clone https://github.com/tu-usuario/itsm.git
cd itsm
```

**Opción B: Descargar desde Emergent**
1. Descarga todo el contenido de `/app/` desde Emergent
2. Sube el archivo .zip a tu servidor
3. Descomprime:
```bash
cd /opt
sudo unzip itsm.zip
sudo mv app itsm  # Renombrar si es necesario
cd itsm
```

**Opción C: Copiar manualmente**
```bash
sudo mkdir -p /opt/itsm
# Luego copia todos los archivos de backend/ y frontend/
```

### PASO 6: Configurar Backend

```bash
cd /opt/itsm/backend

# Instalar dependencias Python
sudo pip3 install -r requirements.txt

# Crear archivo .env
sudo nano .env
```

Pega este contenido en `.env`:
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="itsm_database"
CORS_ORIGINS="*"
SECRET_KEY="$(openssl rand -hex 32)"

# Opcional: Configuración de SendGrid para emails
# SENDGRID_API_KEY="tu-api-key-aqui"
# SENDGRID_FROM_EMAIL="noreply@tudominio.com"
```

Guarda y cierra (Ctrl+O, Enter, Ctrl+X).

### PASO 7: Configurar Frontend

```bash
cd /opt/itsm/frontend

# Instalar dependencias
sudo yarn install

# Crear archivo .env
sudo nano .env
```

Pega este contenido en `.env`:
```bash
REACT_APP_BACKEND_URL="http://localhost:8001"
```

**Nota:** Cambia `localhost` por la IP o dominio de tu servidor si accedes desde otra máquina.

Guarda y cierra.

### PASO 8: Inicializar Base de Datos

```bash
cd /opt/itsm/backend

# Crear usuario administrador
python3 << 'PYEOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

async def init_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["itsm_database"]
    
    # Verificar si ya existe
    existing = await db.usuarios.find_one({"email": "admin@itsm.com"})
    if existing:
        print("Usuario admin ya existe")
        return
    
    # Crear usuario admin
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
    print("✓ Usuario admin creado: admin@itsm.com / admin123")
    client.close()

asyncio.run(init_db())
PYEOF
```

### PASO 9: Crear Servicios Systemd

**Servicio Backend:**
```bash
sudo nano /etc/systemd/system/itsm-backend.service
```

Pega este contenido:
```ini
[Unit]
Description=ITSM Backend FastAPI Service
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/itsm/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Servicio Frontend:**
```bash
sudo nano /etc/systemd/system/itsm-frontend.service
```

Pega este contenido:
```ini
[Unit]
Description=ITSM Frontend React App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/itsm/frontend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### PASO 10: Iniciar Servicios

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicios para inicio automático
sudo systemctl enable itsm-backend
sudo systemctl enable itsm-frontend

# Iniciar servicios
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend

# Verificar estado
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
```

### PASO 11: Verificar Instalación

```bash
# Verificar backend
curl http://localhost:8001/api/health

# Verificar frontend (debe devolver HTML)
curl -I http://localhost:3000

# Ver logs en tiempo real
sudo journalctl -u itsm-backend -f
sudo journalctl -u itsm-frontend -f
```

---

## 🌐 Acceso al Sistema

Una vez que ambos servicios estén corriendo:

- **Frontend:** http://tu-servidor:3000
- **Backend API Docs:** http://tu-servidor:8001/docs
- **Credenciales:** admin@itsm.com / admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

---

## 🔧 Configuración del Firewall

Si usas UFW:
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8001/tcp
sudo ufw status
```

---

## 🔄 Comandos Útiles

```bash
# Ver logs
sudo journalctl -u itsm-backend -n 100
sudo journalctl -u itsm-frontend -n 100

# Reiniciar servicios
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend

# Detener servicios
sudo systemctl stop itsm-backend
sudo systemctl stop itsm-frontend

# Ver estado
sudo systemctl status itsm-backend itsm-frontend
```

---

## 🆘 Solución de Problemas

### Backend no inicia
```bash
# Ver logs completos
sudo journalctl -u itsm-backend -n 200

# Verificar MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# Verificar dependencias
cd /opt/itsm/backend
pip3 install -r requirements.txt
```

### Frontend no inicia
```bash
# Ver logs
sudo journalctl -u itsm-frontend -n 200

# Reinstalar dependencias
cd /opt/itsm/frontend
rm -rf node_modules
yarn install

# Verificar archivo .env
cat .env
```

### No puedo acceder desde fuera
```bash
# Verificar firewall
sudo ufw status

# Verificar que los servicios escuchan en 0.0.0.0
sudo netstat -tulpn | grep -E "3000|8001"
```

---

## ✨ Próximos Pasos

1. Cambiar contraseña de admin
2. Crear tu primera empresa
3. Registrar equipos
4. Crear bitácoras de mantenimiento
5. Probar el botón "Ver Historial" en Equipos
6. Configurar backup de MongoDB
7. Configurar SendGrid (opcional)

---

## 📞 Soporte

Si encuentras problemas, revisa:
1. Los logs de los servicios
2. Que MongoDB esté corriendo
3. Que los puertos no estén siendo usados por otros servicios
4. Que los archivos .env estén configurados correctamente

---

¡Listo! Tu Sistema ITSM está instalado y funcionando.
