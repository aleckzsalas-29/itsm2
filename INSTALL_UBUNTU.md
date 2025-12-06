# Instrucciones de Instalación - Sistema ITSM
## Instalación en Servidor Ubuntu

### Requisitos Previos
- Ubuntu 20.04 LTS o superior
- Python 3.9 o superior
- Node.js 18 o superior
- MongoDB 5.0 o superior

### Paso 1: Actualizar el Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Paso 2: Instalar Dependencias del Sistema
```bash
# Instalar Python y herramientas
sudo apt install python3 python3-pip python3-venv git -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Paso 3: Clonar o Copiar el Proyecto
```bash
# Clonar desde repositorio o copiar archivos
cd /opt
sudo git clone <tu-repositorio> itsm
# O copiar archivos manualmente
sudo mkdir -p /opt/itsm
# Copiar backend/ y frontend/ al directorio /opt/itsm
```

### Paso 4: Configurar Backend
```bash
cd /opt/itsm/backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
sudo nano .env
```

**Contenido del archivo .env:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=itsm_db
CORS_ORIGINS=http://localhost:3000,http://your-domain.com
JWT_SECRET=your_super_secret_key_change_this_in_production
ENCRYPTION_KEY=generate_key_with_fernet_or_use_existing
SENDGRID_API_KEY=your_sendgrid_api_key_optional
SENDER_EMAIL=noreply@your-domain.com
```

**Generar ENCRYPTION_KEY:**
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Paso 5: Configurar Frontend
```bash
cd /opt/itsm/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
sudo nano .env
```

**Contenido del archivo .env del frontend:**
```env
REACT_APP_BACKEND_URL=http://your-domain.com:8000
# o para producción con dominio:
# REACT_APP_BACKEND_URL=https://api.your-domain.com
```

### Paso 6: Crear Servicios Systemd

**Servicio Backend:**
```bash
sudo nano /etc/systemd/system/itsm-backend.service
```

```ini
[Unit]
Description=ITSM Backend API
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/itsm/backend
Environment="PATH=/opt/itsm/backend/venv/bin"
ExecStart=/opt/itsm/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Servicio Frontend:**
```bash
sudo nano /etc/systemd/system/itsm-frontend.service
```

```ini
[Unit]
Description=ITSM Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/itsm/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Paso 7: Iniciar Servicios
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar servicios
sudo systemctl enable itsm-backend
sudo systemctl enable itsm-frontend
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend

# Verificar estado
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
```

### Paso 8: Configurar Nginx (Opcional pero Recomendado)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/itsm
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/itsm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 9: Configurar SSL con Let's Encrypt (Producción)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Paso 10: Configurar Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
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
