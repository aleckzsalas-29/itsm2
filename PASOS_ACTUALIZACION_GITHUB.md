# 📋 Pasos para Actualizar desde GitHub

## ✅ Archivos Modificados en este Update

### Backend:
1. `backend/server.py` - 3 nuevos endpoints agregados
2. `backend/pdf_service.py` - Nueva función para PDF detallado
3. `backend/database.py` - Agregado load_dotenv()

### Frontend:
1. `frontend/src/pages/Bitacoras.jsx` - Botones PDF detallado (ya actualizado)
2. `frontend/src/pages/Servicios.jsx` - Filtro por empresa (ya actualizado)

### Documentación:
1. `NUEVAS_MEJORAS.md` - Documentación de features
2. `FIX_UBUNTU_SERVER.md` - Guía de corrección de rutas
3. `PASOS_ACTUALIZACION_GITHUB.md` - Este archivo

---

## 🚀 PASOS PARA ACTUALIZAR TU SERVIDOR

### Paso 1: Conectar a tu Servidor

```bash
ssh root@108.181.199.108
```

---

### Paso 2: Ir al Directorio del Proyecto

```bash
cd /opt/itsm
```

---

### Paso 3: Hacer Backup (Importante)

```bash
# Crear backup completo
sudo cp -r /opt/itsm /opt/itsm.backup.$(date +%Y%m%d_%H%M%S)

# O al menos backup de archivos críticos
cp backend/server.py backend/server.py.backup
cp backend/pdf_service.py backend/pdf_service.py.backup
cp backend/database.py backend/database.py.backup
cp frontend/src/pages/Bitacoras.jsx frontend/src/pages/Bitacoras.jsx.backup
```

---

### Paso 4: Ver Estado Actual de Git

```bash
git status
```

Si hay cambios locales sin commit, guárdalos:

```bash
git stash
```

---

### Paso 5: Configurar Git con tus Credenciales (Si no lo has hecho)

```bash
git config user.email "tu-email@ejemplo.com"
git config user.name "Tu Nombre"
```

---

### Paso 6: Pull desde GitHub

```bash
# Ver el remote configurado
git remote -v
# Debe mostrar: origin  https://github.com/aleckzsalas-29/itsm2.git

# Fetch desde GitHub
git fetch origin master

# Ver qué cambios hay
git log HEAD..origin/master --oneline

# Pull los cambios
git pull origin master
```

**Si pide credenciales:**
- Username: `aleckzsalas-29`
- Password: Tu **Personal Access Token** (comienza con `ghp_`)

---

### Paso 7: Instalar Dependencias Nuevas

```bash
# Backend - Instalar python-dotenv
cd /opt/itsm/backend
source venv/bin/activate
pip install python-dotenv
deactivate

# Frontend - Si hay nuevas dependencias
cd /opt/itsm/frontend
yarn install
```

---

### Paso 8: Verificar Archivo .env

```bash
cat /opt/itsm/backend/.env
```

Debe tener:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=itsm_db
JWT_SECRET=...
ENCRYPTION_KEY=...
CORS_ORIGINS=http://localhost:3000,http://108.181.199.108:3000,http://108.181.199.108
```

---

### Paso 9: Reiniciar Servicios

```bash
# Verificar MongoDB
sudo systemctl status mongod
# Si no está corriendo:
sudo systemctl start mongod

# Reiniciar backend
sudo systemctl restart itsm-backend

# Reiniciar frontend
sudo systemctl restart itsm-frontend

# Esperar que inicien
sleep 10
```

---

### Paso 10: Verificar que Funciona

```bash
# Test backend
curl http://localhost:8000/api/
# Debe responder: {"message":"Sistema ITSM API"}

# Test frontend
curl http://localhost:3000
# Debe mostrar HTML

# Test nuevos endpoints
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itsm.com","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s http://localhost:8000/api/configuracion/campos-tipo-equipo/laptop \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

### Paso 11: Verificar en el Navegador

1. Ve a: `http://108.181.199.108:3000`
2. Login con: `admin@itsm.com` / `admin123`
3. Verificar:
   - **Bitácoras** → Debe tener botones "PDF Detallado"
   - **Servicios** → Debe tener filtro por empresa
   - **Backend** → Todos los endpoints funcionando

---

## 🔍 Troubleshooting

### Error: "Your local changes would be overwritten"

```bash
# Guardar cambios locales
git stash

# Hacer pull
git pull origin master

# Restaurar cambios si es necesario
git stash pop
```

---

### Error: Backend no inicia

```bash
# Ver logs
sudo journalctl -u itsm-backend -n 100 --no-pager

# Problemas comunes:
# 1. .env incompleto - verificar que tenga todas las variables
# 2. MongoDB no corriendo - sudo systemctl start mongod
# 3. python-dotenv no instalado - pip install python-dotenv
```

---

### Error: Frontend no compila

```bash
# Ver logs
sudo journalctl -u itsm-frontend -n 100 --no-pager

# Reinstalar dependencias
cd /opt/itsm/frontend
rm -rf node_modules
yarn install

# Reiniciar
sudo systemctl restart itsm-frontend
```

---

### Error: Authentication failed al hacer pull

Necesitas un **Personal Access Token**:

1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Marca: `repo` (todos los checkboxes)
4. Genera y copia el token
5. Úsalo como contraseña al hacer `git pull`

Para no tenerlo que poner siempre:
```bash
git config credential.helper 'cache --timeout=3600'
```

---

## 📊 Resumen de Cambios

### ✅ Backend (3 nuevos endpoints):
1. `GET /api/equipos/{id}/historial` - Ver historial de revisiones
2. `GET /api/bitacoras/exportar-pdf-detallado` - PDF con todo el contenido
3. `GET /api/configuracion/campos-tipo-equipo/{tipo}` - Campos específicos por tipo

### ✅ Frontend:
1. Botones "PDF Detallado" en Bitácoras
2. Filtro por empresa en Servicios

### ✅ Mejoras Técnicas:
1. `load_dotenv()` en database.py - Carga automática de .env
2. Rutas relativas en pdf_service.py - Compatible con cualquier ubicación
3. Documentación completa en NUEVAS_MEJORAS.md

---

## 🎉 Después de Actualizar

Tu sistema tendrá:
- ✅ Historial completo de cada equipo
- ✅ Reportes PDF detallados de bitácoras
- ✅ Campos específicos por tipo de equipo (laptop, servidor, etc.)
- ✅ Filtrado de servicios por empresa
- ✅ Sistema más robusto y escalable

---

## 📞 Soporte

Si algo falla:
1. Revisa logs: `sudo journalctl -u itsm-backend -n 50`
2. Verifica .env: `cat /opt/itsm/backend/.env`
3. Comprueba servicios: `sudo systemctl status itsm-backend itsm-frontend mongod`

Para restaurar backup:
```bash
sudo systemctl stop itsm-backend itsm-frontend
sudo rm -rf /opt/itsm
sudo cp -r /opt/itsm.backup.FECHA /opt/itsm
sudo systemctl start itsm-backend itsm-frontend
```
