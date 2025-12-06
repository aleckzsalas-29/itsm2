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
pip install fastapi uvicorn motor pymongo pydantic python-jose[cryptography] passlib[bcrypt] python-multipart sendgrid fpdf2 python-dotenv cryptography email-validator
```

**Nota:** El sistema requiere Python 3.9+ para funcionalidad completa de Pydantic v2.

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

---

## 🎉 ¡INSTALACIÓN COMPLETADA!

### Acceder al Sistema

**Con Nginx (puerto 80/443):**
- URL: `http://tu-dominio.com` o `https://tu-dominio.com`
- O: `http://tu-ip-servidor`

**Sin Nginx (puertos directos):**
- Frontend: `http://tu-ip:3000`
- Backend: `http://tu-ip:8000/api/`

### Credenciales por Defecto

```
Usuario: admin@itsm.com
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambia la contraseña inmediatamente después del primer inicio de sesión en **Usuarios** → **Editar Admin**.

---

## 🆕 FUNCIONALIDADES DEL SISTEMA

### Módulos Principales

El Sistema ITSM incluye los siguientes módulos completos:

1. **📊 Dashboard**
   - Estadísticas generales del sistema
   - Resumen de equipos activos, bitácoras pendientes, y servicios
   - Visualización de costos mensuales de servicios

2. **🏢 Empresas**
   - Gestión completa de empresas/clientes
   - Información de contacto y detalles
   - Campos personalizables

3. **💻 Equipos**
   - Registro detallado de equipos (Laptops, Desktops, Servidores)
   - Especificaciones técnicas (RAM, CPU, Disco Duro)
   - Credenciales de Windows y Email (encriptadas)
   - Asignación a empresas
   - **Campos personalizados** dinámicos

4. **📝 Bitácoras de Mantenimiento**
   - Registro de mantenimientos preventivos y correctivos
   - Checklists de tareas realizadas
   - Asignación de técnicos
   - Filtrado por empresa y equipo
   - Exportación a CSV
   - **Campos personalizados** dinámicos

5. **🔧 Servicios Contratados**
   - Gestión de hosting, licencias, VPS
   - Fechas de contratación y renovación
   - Costos mensuales
   - Credenciales encriptadas
   - **Campos personalizados** dinámicos

6. **📄 Reportes**
   - Generación de reportes en PDF
   - Reportes por empresa (equipos, bitácoras, servicios)
   - Reportes por equipo individual
   - Logo personalizable en reportes

7. **👥 Gestión de Usuarios**
   - Roles: Administrador, Cliente, Técnico
   - Control de acceso basado en roles
   - Gestión de credenciales

8. **⚙️ Configuración del Sistema**
   - Cambio de nombre del sistema
   - Subida de logo corporativo
   - **🆕 Campos Personalizados:** Permite a los administradores agregar campos dinámicos a cualquier entidad

### 🆕 Campos Personalizados (Nueva Funcionalidad)

El sistema ahora incluye una funcionalidad avanzada para personalizar campos en todas las entidades:

**¿Qué son los Campos Personalizados?**
- Permiten agregar campos adicionales específicos a las necesidades de tu organización
- Configurables desde la interfaz de administración
- Soportan múltiples tipos de datos

**Tipos de Campos Soportados:**
- ✅ **Texto:** Para información alfanumérica (ej: "Número de Activo", "Ubicación Específica")
- ✅ **Número:** Para valores numéricos (ej: "Horas de Uso", "Costo de Reparación")
- ✅ **Fecha:** Para fechas importantes (ej: "Garantía Hasta", "Última Inspección")
- ✅ **Selección (Select):** Para opciones predefinidas (ej: "Departamento", "Estado de Garantía")
- ✅ **Checkbox:** Para valores booleanos (ej: "Incluye Mouse", "Tiene Antivirus")

**Dónde se pueden usar:**
- Equipos
- Bitácoras
- Empresas
- Servicios

**Cómo configurar:**
1. Iniciar sesión como Administrador
2. Ir a **Configuración** → **Configurar Campos**
3. Seleccionar la entidad (Equipos, Bitácoras, etc.)
4. Click en **Agregar Campo**
5. Completar:
   - Nombre del campo
   - Tipo (Texto, Número, Fecha, Select, Checkbox)
   - Si es requerido o no
   - Opciones (solo para tipo Select)
6. Guardar

**Los campos personalizados aparecerán automáticamente** en los formularios de creación/edición de la entidad seleccionada.

**Ejemplo práctico:**
Para Equipos, puedes agregar:
- "Número de Activo" (Texto)
- "Fecha de Compra" (Fecha)
- "Departamento" (Select: IT, Ventas, Administración)
- "Garantía Vigente" (Checkbox)

### Características de Seguridad

- 🔐 **Autenticación JWT:** Tokens seguros para autenticación
- 🔒 **Encriptación de Contraseñas:** Contraseñas de usuarios, Windows y correos encriptadas
- 🛡️ **Control de Acceso:** Permisos basados en roles
- 📧 **Notificaciones por Email:** Alertas automáticas vía SendGrid (opcional)

### Reportes y Exportación

- **PDF:** Reportes profesionales con logo personalizado
- **CSV:** Exportación de bitácoras para análisis
- **Filtros:** Por empresa, fecha, técnico, estado

---

## 🔧 COMANDOS ÚTILES

### Ver Estado de Servicios

```bash
# Ver todos los servicios
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
sudo systemctl status mongod
sudo systemctl status nginx
```

### Ver Logs en Tiempo Real

```bash
# Backend
sudo journalctl -u itsm-backend -f

# Frontend
sudo journalctl -u itsm-frontend -f

# MongoDB
sudo journalctl -u mongod -f

# Nginx
sudo tail -f /var/log/nginx/itsm-access.log
sudo tail -f /var/log/nginx/itsm-error.log

# O ver archivos de log directos
sudo tail -f /var/log/itsm-backend.log
sudo tail -f /var/log/itsm-backend.error.log
sudo tail -f /var/log/itsm-frontend.log
```

### Reiniciar Servicios

```bash
# Reiniciar backend
sudo systemctl restart itsm-backend

# Reiniciar frontend
sudo systemctl restart itsm-frontend

# Reiniciar MongoDB
sudo systemctl restart mongod

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar todo
sudo systemctl restart itsm-backend itsm-frontend mongod nginx
```

### Detener Servicios

```bash
sudo systemctl stop itsm-backend
sudo systemctl stop itsm-frontend
```

---

## 💾 BACKUP Y RESTAURACIÓN

### Crear Backup de Base de Datos

```bash
# Crear directorio de backups
sudo mkdir -p /backup/itsm

# Backup completo
sudo mongodump --db itsm_db --out /backup/itsm/backup_$(date +%Y%m%d_%H%M%S)

# Listar backups
ls -lh /backup/itsm/
```

### Restaurar Base de Datos

```bash
# Restaurar desde un backup específico
sudo mongorestore --db itsm_db /backup/itsm/backup_20241206_120000/itsm_db

# Restaurar con drop (reemplaza completamente la BD)
sudo mongorestore --db itsm_db --drop /backup/itsm/backup_20241206_120000/itsm_db
```

### Backup Automático (Opcional)

Crear script de backup automático:

```bash
sudo nano /usr/local/bin/backup-itsm.sh
```

Contenido:

```bash
#!/bin/bash
BACKUP_DIR="/backup/itsm"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Crear backup
mongodump --db itsm_db --out ${BACKUP_DIR}/backup_${DATE}

# Comprimir backup
tar -czf ${BACKUP_DIR}/backup_${DATE}.tar.gz -C ${BACKUP_DIR} backup_${DATE}
rm -rf ${BACKUP_DIR}/backup_${DATE}

# Eliminar backups antiguos
find ${BACKUP_DIR} -name "backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completado: backup_${DATE}.tar.gz"
```

Hacer ejecutable y agregar a cron:

```bash
sudo chmod +x /usr/local/bin/backup-itsm.sh

# Agregar a crontab para ejecutar diario a las 2 AM
sudo crontab -e
```

Agregar línea:
```
0 2 * * * /usr/local/bin/backup-itsm.sh >> /var/log/itsm-backup.log 2>&1
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

## 🔄 Actualización del Sistema

### Proceso de Actualización Completo

```bash
# 1. Detener servicios temporalmente
sudo systemctl stop itsm-backend
sudo systemctl stop itsm-frontend

# 2. Backup OBLIGATORIO de base de datos antes de actualizar
sudo mkdir -p /backup/itsm
sudo mongodump --db itsm_db --out /backup/itsm/backup_pre_update_$(date +%Y%m%d_%H%M%S)

# 3. Navegar al directorio del proyecto
cd /opt/itsm

# 4. Actualizar código (elegir una opción)

## OPCIÓN A: Desde Git
git pull origin main

## OPCIÓN B: Subir manualmente archivos nuevos
# (Usar SCP o SFTP para subir archivos actualizados)

# 5. Actualizar dependencias del Backend
cd /opt/itsm/backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 6. Actualizar dependencias del Frontend
cd /opt/itsm/frontend
yarn install
# O si usas npm:
# npm install

# 7. Verificar archivos .env (NO sobrescribir si ya existen)
# Revisar si hay nuevas variables de entorno en la documentación
ls -la /opt/itsm/backend/.env
ls -la /opt/itsm/frontend/.env

# 8. Iniciar servicios nuevamente
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend

# 9. Verificar que todo funciona
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend

# 10. Verificar en el navegador
curl http://localhost:8000/api/
# Debe retornar: {"message":"Sistema ITSM API"}
```

### Verificar Logs Después de Actualizar

```bash
# Ver logs del backend
sudo journalctl -u itsm-backend -n 50

# Ver logs del frontend
sudo journalctl -u itsm-frontend -n 50

# Si hay errores, revisar logs detallados
sudo tail -f /var/log/itsm-backend.error.log
sudo tail -f /var/log/itsm-frontend.log
```

### Rollback en Caso de Problemas

Si algo falla después de la actualización:

```bash
# 1. Detener servicios
sudo systemctl stop itsm-backend
sudo systemctl stop itsm-frontend

# 2. Restaurar base de datos desde backup
sudo mongorestore --db itsm_db --drop /backup/itsm/backup_pre_update_FECHA/itsm_db

# 3. Revertir código (si usas Git)
cd /opt/itsm
git reset --hard HEAD~1

# 4. Reinstalar dependencias anteriores
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
yarn install

# 5. Reiniciar servicios
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend
```

### Changelog de Versiones

**Versión Actual (Diciembre 2024):**
- ✅ Sistema completo de gestión ITSM
- ✅ Módulos: Empresas, Equipos, Bitácoras, Servicios, Reportes, Usuarios
- ✅ **NUEVO:** Campos Personalizados dinámicos para todas las entidades
- ✅ Componente reutilizable `CustomFieldsRenderer` para renderizado de campos
- ✅ Página de configuración de campos (`/campos-personalizados`)
- ✅ API completa para gestión de campos custom
- ✅ Encriptación de credenciales con Fernet
- ✅ Generación de reportes PDF con logo personalizable
- ✅ Exportación CSV de bitácoras
- ✅ Integración SendGrid para notificaciones (opcional)
- ✅ Autenticación JWT
- ✅ Compatibilidad con Pydantic v2

**Notas de Migración:**
- Si actualizas desde una versión sin campos personalizados, la migración es automática
- Los modelos ya incluyen el campo `campos_personalizados` como diccionario vacío por defecto
- No se requieren cambios manuales en la base de datos

## Soporte

Para soporte adicional o reportar problemas, contacta al administrador del sistema o consulta la documentación en el repositorio.
