# 📋 Guía de Instalación - Sistema ITSM en Ubuntu

## Requisitos Previos
- ✅ **Servidor Ubuntu 20.04 LTS o superior**
- ✅ **Acceso root o sudo**
- ✅ **Mínimo 2GB RAM**
- ✅ **Mínimo 10GB de espacio en disco**
- ✅ **Conexión a Internet**

---

## 🚀 INSTALACIÓN PASO A PASO

### Paso 1: Actualizar el Sistema

Conectarse al servidor y actualizar paquetes:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git build-essential -y
```

### Paso 2: Instalar Python 3.10+

```bash
# Instalar Python y herramientas
sudo apt install python3 python3-pip python3-venv -y

# Verificar versión (debe ser 3.9+)
python3 --version
```

### Paso 3: Instalar Node.js 18

```bash
# Agregar repositorio de Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js y npm
sudo apt install nodejs -y

# Verificar versiones
node --version   # Debe mostrar v18.x.x
npm --version    # Debe mostrar 9.x.x o superior
```

### Paso 4: Instalar MongoDB 5.0+

```bash
# Importar clave pública de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Crear archivo de lista para MongoDB (Ubuntu 20.04)
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Actualizar e instalar MongoDB
sudo apt update
sudo apt install mongodb-org -y

# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar que MongoDB está corriendo
sudo systemctl status mongod
```

### Paso 5: Descargar el Proyecto

**OPCIÓN A: Desde este entorno (Emergent)**

```bash
# Crear directorio
sudo mkdir -p /opt/itsm

# Descargar archivos desde Emergent
# (Usar el botón de descarga en Emergent para obtener el ZIP completo)
# Luego subir al servidor y descomprimir

cd /opt
sudo unzip itsm.zip
sudo mv <carpeta-descomprimida> itsm
```

**OPCIÓN B: Desde repositorio Git (si ya lo subiste)**

```bash
cd /opt
sudo git clone <URL-de-tu-repositorio> itsm
```

**OPCIÓN C: Copiar archivos manualmente**

Desde tu máquina local, usar SCP:

```bash
# En tu máquina local
scp -r ./backend ./frontend usuario@tu-servidor:/tmp/

# En el servidor
sudo mkdir -p /opt/itsm
sudo mv /tmp/backend /opt/itsm/
sudo mv /tmp/frontend /opt/itsm/
```

### Paso 6: Configurar el Backend

```bash
cd /opt/itsm/backend

# Crear entorno virtual de Python
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt
```

**Si requirements.txt no existe, instalarlo manualmente:**

```bash
pip install fastapi uvicorn motor pymongo pydantic python-jose[cryptography] passlib[bcrypt] python-multipart sendgrid fpdf2 python-dotenv cryptography
```

### Paso 7: Crear Archivo .env del Backend

```bash
cd /opt/itsm/backend

# Crear archivo .env
sudo nano .env
```

**Copiar y pegar este contenido (modificar valores según tu servidor):**

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=itsm_db

# CORS (agregar tu dominio)
CORS_ORIGINS=http://localhost:3000,http://tu-dominio.com,https://tu-dominio.com

# JWT Secret (generar uno único y seguro)
JWT_SECRET=CAMBIAR_POR_CLAVE_SEGURA_ALEATORIA_LARGA

# Encryption Key (generar con el comando de abajo)
ENCRYPTION_KEY=GENERAR_CON_COMANDO_ABAJO

# SendGrid (OPCIONAL - solo si quieres enviar emails)
SENDGRID_API_KEY=
SENDER_EMAIL=noreply@tu-dominio.com
```

**Generar ENCRYPTION_KEY seguro:**

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copiar el resultado y pegarlo en `ENCRYPTION_KEY=` en el archivo .env

**Generar JWT_SECRET seguro:**

```bash
openssl rand -hex 32
```

Copiar el resultado y pegarlo en `JWT_SECRET=` en el archivo .env

**Guardar archivo:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Paso 8: Configurar el Frontend

```bash
cd /opt/itsm/frontend

# Instalar Yarn (recomendado) o usar npm
sudo npm install -g yarn

# Instalar dependencias
yarn install
# O si usas npm:
# npm install
```

### Paso 9: Crear Archivo .env del Frontend

```bash
cd /opt/itsm/frontend

# Crear archivo .env
sudo nano .env
```

**Copiar y pegar (modificar según tu configuración):**

```env
# Para desarrollo local
REACT_APP_BACKEND_URL=http://localhost:8000

# Para producción con dominio
# REACT_APP_BACKEND_URL=https://tu-dominio.com

# Para producción con subdominio API
# REACT_APP_BACKEND_URL=https://api.tu-dominio.com

REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Importante:** El backend SIEMPRE debe tener `/api` en las rutas, el CORS se configurará automáticamente.

**Guardar archivo:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Paso 10: Probar la Instalación Manualmente (Opcional)

**Probar Backend:**

```bash
cd /opt/itsm/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000
```

Abrir en navegador: `http://tu-ip:8000/api/`
Deberías ver: `{"message":"Sistema ITSM API"}`

Presionar `Ctrl + C` para detener.

**Probar Frontend:**

```bash
cd /opt/itsm/frontend
yarn start
# O: npm start
```

Abrir en navegador: `http://tu-ip:3000`

Presionar `Ctrl + C` para detener.

### Paso 11: Crear Servicios Systemd

**11.1 - Crear servicio del Backend:**

```bash
sudo nano /etc/systemd/system/itsm-backend.service
```

**Copiar y pegar este contenido:**

```ini
[Unit]
Description=ITSM Backend API
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/itsm/backend
Environment="PATH=/opt/itsm/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/opt/itsm/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10
StandardOutput=append:/var/log/itsm-backend.log
StandardError=append:/var/log/itsm-backend.error.log

[Install]
WantedBy=multi-user.target
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

**11.2 - Crear servicio del Frontend:**

```bash
sudo nano /etc/systemd/system/itsm-frontend.service
```

**Copiar y pegar este contenido:**

```ini
[Unit]
Description=ITSM Frontend React App
After=network.target itsm-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/itsm/frontend
Environment="PATH=/usr/bin:/usr/local/bin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/itsm-frontend.log
StandardError=append:/var/log/itsm-frontend.error.log

[Install]
WantedBy=multi-user.target
```

**Nota:** Si usas npm en lugar de yarn, cambiar `ExecStart=/usr/bin/npm start`

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Paso 12: Iniciar los Servicios

```bash
# Recargar configuración de systemd
sudo systemctl daemon-reload

# Habilitar servicios para que inicien al arrancar
sudo systemctl enable itsm-backend
sudo systemctl enable itsm-frontend

# Iniciar servicios
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend

# Verificar estado
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
```

**Los servicios deberían mostrar:** `Active: active (running)`

### Paso 13: Verificar que Funciona

```bash
# Verificar Backend
curl http://localhost:8000/api/
# Debe retornar: {"message":"Sistema ITSM API"}

# Verificar Frontend (desde navegador)
# http://tu-ip:3000
```

### Paso 14: Configurar Nginx (Recomendado para Producción)

**14.1 - Instalar Nginx:**

```bash
sudo apt install nginx -y
```

**14.2 - Crear configuración del sitio:**

```bash
sudo nano /etc/nginx/sites-available/itsm
```

**Copiar y pegar (modificar `tu-dominio.com`):**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Logs
    access_log /var/log/nginx/itsm-access.log;
    error_log /var/log/nginx/itsm-error.log;

    # Frontend React
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (si es necesario)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # Aumentar tamaño máximo de archivo para subir logos
    client_max_body_size 10M;
}
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

**14.3 - Activar sitio:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/itsm /etc/nginx/sites-enabled/

# Eliminar sitio por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 15: Configurar SSL con Let's Encrypt (HTTPS)

**Solo si tienes un dominio apuntando al servidor:**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL (cambiar tu-dominio.com)
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# El certificado se renovará automáticamente
```

**Actualizar .env del frontend para usar HTTPS:**

```bash
sudo nano /opt/itsm/frontend/.env
```

Cambiar a: `REACT_APP_BACKEND_URL=https://tu-dominio.com`

```bash
# Reiniciar frontend
sudo systemctl restart itsm-frontend
```

### Paso 16: Configurar Firewall

```bash
# Habilitar firewall y permitir servicios necesarios
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar reglas
sudo ufw status
```

## Acceso Inicial

Una vez instalado, accede al sistema:
- **URL:** http://your-domain.com (o http://server-ip)
- **Usuario:** admin@itsm.com
- **Contraseña:** admin123

**¡IMPORTANTE!** Cambia la contraseña del administrador inmediatamente después del primer inicio de sesión.

## Mantenimiento

### Ver Logs
```bash
# Backend
sudo journalctl -u itsm-backend -f

# Frontend
sudo journalctl -u itsm-frontend -f

# MongoDB
sudo journalctl -u mongod -f
```

### Reiniciar Servicios
```bash
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend
sudo systemctl restart mongod
```

### Backup de Base de Datos
```bash
mongodump --db itsm_db --out /backup/itsm_$(date +%Y%m%d)
```

### Restaurar Base de Datos
```bash
mongorestore --db itsm_db /backup/itsm_20240115/itsm_db
```

## Resolución de Problemas

### Backend no inicia
```bash
# Verificar logs
sudo journalctl -u itsm-backend -n 50

# Verificar que MongoDB está corriendo
sudo systemctl status mongod

# Verificar variables de entorno
cat /opt/itsm/backend/.env
```

### Frontend no carga
```bash
# Verificar logs
sudo journalctl -u itsm-frontend -n 50

# Verificar que el backend está corriendo
curl http://localhost:8000/api/
```

### Problemas de conexión a MongoDB
```bash
# Verificar estado
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Verificar conexión
mongo --eval "db.adminCommand('ping')"
```

## Actualización

```bash
cd /opt/itsm

# Backup de base de datos
mongodump --db itsm_db --out /backup/itsm_backup_pre_update

# Actualizar código
git pull origin main  # o copiar nuevos archivos

# Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Actualizar frontend
cd ../frontend
npm install

# Reiniciar servicios
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend
```

## Soporte

Para soporte adicional o reportar problemas, contacta al administrador del sistema o consulta la documentación en el repositorio.
