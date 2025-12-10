# Paquete de Instalación Completa - Sistema ITSM

## 📦 Contenido

Este directorio contiene todo lo necesario para hacer una **instalación limpia** del Sistema ITSM en tu servidor Ubuntu.

## 🚀 Método Recomendado: Usar Repositorio Git

La forma más fácil es clonar todo este código directamente en tu servidor:

```bash
# 1. En tu servidor limpio
cd /opt
sudo git clone [URL_DE_TU_REPO] itsm

# 2. Configurar Backend
cd /opt/itsm/backend
sudo pip3 install -r requirements.txt

# 3. Crear archivo .env
sudo nano .env
```

Contenido del `.env`:
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="itsm_database"
CORS_ORIGINS="*"
SECRET_KEY="tu-secret-key-aqui"
```

```bash
# 4. Configurar Frontend
cd /opt/itsm/frontend
sudo yarn install

# 5. Crear archivo .env
sudo nano .env
```

Contenido del `.env`:
```
REACT_APP_BACKEND_URL="http://tu-servidor-ip:8001"
```

```bash
# 6. Iniciar servicios (ver instrucciones abajo)
```

## 📋 Instrucciones Detalladas

Ver el archivo `INSTRUCCIONES_COMPLETAS.md` en este directorio.

## ✨ Funcionalidades Incluidas

- ✅ Ver Historial de Mantenimiento de Equipos
- ✅ Campos Dinámicos por Tipo de Equipo
- ✅ Gestión completa de Empresas, Equipos, Bitácoras, Servicios
- ✅ Sistema de autenticación y roles
- ✅ Exportación de reportes PDF
- ✅ Envío de emails (con SendGrid)

