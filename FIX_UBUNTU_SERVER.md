# 🔧 Corrección de Rutas para Servidor Ubuntu

## Problema Identificado

El código tenía rutas hardcodeadas para `/app/backend/pdfs` que funcionan en el contenedor de Emergent, pero no en un servidor Ubuntu donde el proyecto está en `/opt/itsm/`.

## ✅ Correcciones Realizadas

He modificado los siguientes archivos para usar rutas relativas:

1. **`/app/backend/pdf_service.py`** (línea 177)
2. **`/app/backend/server.py`** (línea 565)

Ahora usan rutas relativas que funcionan en cualquier ubicación.

---

## 📋 Pasos para Aplicar en Tu Servidor

### 1. Descargar Archivos Corregidos

Desde Emergent, descarga el proyecto actualizado o copia manualmente los archivos:
- `backend/pdf_service.py`
- `backend/server.py`

### 2. Subir al Servidor

```bash
# Opción A: Usar SCP desde tu máquina local
scp backend/pdf_service.py usuario@tu-servidor:/opt/itsm/backend/
scp backend/server.py usuario@tu-servidor:/opt/itsm/backend/

# Opción B: Editar directamente en el servidor
nano /opt/itsm/backend/pdf_service.py
# Buscar línea 177 y cambiar por el código corregido
```

### 3. Código Corregido para pdf_service.py

**Línea 177 - ANTES:**
```python
self.output_dir = "/app/backend/pdfs"
```

**Línea 177 - DESPUÉS:**
```python
# Usar ruta relativa al directorio actual del script
base_dir = os.path.dirname(os.path.abspath(__file__))
self.output_dir = os.path.join(base_dir, "pdfs")
```

### 4. Código Corregido para server.py

**Línea 565 - ANTES:**
```python
filepath = os.path.join("/app/backend/pdfs", filename)
```

**Línea 565 - DESPUÉS:**
```python
# Usar ruta relativa al directorio actual
base_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(base_dir, "pdfs", filename)
```

---

## 🚀 Reiniciar Servicios

Después de aplicar los cambios:

```bash
# Si usas systemd
sudo systemctl restart itsm-backend

# O si ejecutas manualmente
cd /opt/itsm/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## ✅ Verificar que Funciona

```bash
# El backend debe iniciar sin errores
curl http://localhost:8000/api/
# Debe retornar: {"message":"Sistema ITSM API"}

# El directorio pdfs debe crearse automáticamente
ls -la /opt/itsm/backend/pdfs/
```

---

## 📝 Otras Verificaciones

### Permisos del Directorio

Asegúrate de que el usuario que ejecuta el backend tenga permisos:

```bash
# Dar permisos al directorio completo
sudo chown -R $USER:$USER /opt/itsm/backend

# O si usas un usuario específico (ej: www-data)
sudo chown -R www-data:www-data /opt/itsm/backend
```

### Variables de Entorno

Verifica que el archivo `.env` existe:

```bash
cat /opt/itsm/backend/.env
```

Debe contener:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=itsm_db
JWT_SECRET=<tu-secret>
ENCRYPTION_KEY=<tu-key>
CORS_ORIGINS=http://localhost:3000,http://tu-dominio.com
```

---

## 🐛 Troubleshooting

### Error: "Permission denied" al crear pdfs/

```bash
# Crear manualmente el directorio
mkdir -p /opt/itsm/backend/pdfs
chmod 755 /opt/itsm/backend/pdfs
```

### Backend no inicia

```bash
# Ver logs detallados
cd /opt/itsm/backend
source venv/bin/activate
python -c "import server"

# O si usas systemd
sudo journalctl -u itsm-backend -n 50
```

### MongoDB no conecta

```bash
# Verificar que MongoDB está corriendo
sudo systemctl status mongod

# Verificar conexión
mongo --eval "db.adminCommand('ping')"
```

---

## 📦 Script de Instalación Automatizada

Si prefieres un script automatizado:

```bash
#!/bin/bash
# install-itsm-ubuntu.sh

echo "🚀 Instalando Sistema ITSM..."

# Navegar al directorio backend
cd /opt/itsm/backend

# Crear directorio pdfs
mkdir -p pdfs
chmod 755 pdfs

# Activar entorno virtual
source venv/bin/activate

# Verificar dependencias
pip install -r requirements.txt

# Iniciar backend
echo "✅ Iniciando backend..."
uvicorn server:app --host 0.0.0.0 --port 8000 &

# Esperar 5 segundos
sleep 5

# Verificar que funciona
curl http://localhost:8000/api/

echo "✅ Instalación completada!"
```

---

## 💡 Notas Importantes

1. **Las rutas ahora son relativas**: Funcionan sin importar dónde esté instalado el proyecto
2. **El directorio `pdfs/` se crea automáticamente**: Al iniciar el backend
3. **Compatible con Docker y servidores**: Las rutas relativas funcionan en ambos entornos

---

## 📞 Si Necesitas Ayuda

1. Verifica los logs: `sudo journalctl -u itsm-backend -f`
2. Comprueba permisos: `ls -la /opt/itsm/backend/`
3. Verifica MongoDB: `sudo systemctl status mongod`
4. Asegúrate de que el puerto 8000 está libre: `sudo netstat -tulpn | grep 8000`

---

**Última actualización**: Diciembre 2024
