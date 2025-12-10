# 📥 Cómo Descargar el Paquete de Instalación

## 🎯 Tu Objetivo

Necesitas descargar TODO el código de este proyecto desde la plataforma Emergent para instalarlo en tu servidor.

## 📦 Ubicación del Código

El código completo está en este workspace en el directorio `/app/`

```
/app/
├── backend/              ← FastAPI servidor
├── frontend/             ← React aplicación
├── instalacion_limpia/   ← Scripts de instalación
│   ├── LEEME_PRIMERO.txt
│   ├── README.md
│   ├── INSTRUCCIONES_COMPLETAS.md
│   └── instalar.sh       ← Script automático
└── [otros archivos]
```

## 🚀 Métodos para Obtener el Código

### Método 1: Export/Download desde Emergent (FÁCIL)

1. En la interfaz de Emergent, busca un botón que diga:
   - "Download Project"
   - "Export"
   - "Download as ZIP"
   - O un icono de descarga ⬇️

2. Descarga todo el proyecto

3. Descomprime en tu servidor:
   ```bash
   cd /tmp
   unzip proyecto-itsm.zip
   cd app/instalacion_limpia
   sudo bash instalar.sh
   ```

### Método 2: Save to GitHub (RECOMENDADO)

1. En Emergent, busca la opción "Save to GitHub" o "Push to GitHub"

2. Conecta tu cuenta de GitHub si no lo has hecho

3. El código se subirá automáticamente a un repositorio

4. En tu servidor, clona el repositorio:
   ```bash
   cd /opt
   git clone https://github.com/tu-usuario/nombre-repo.git itsm
   cd itsm/instalacion_limpia
   sudo bash instalar.sh
   ```

### Método 3: Transferencia Manual (Si los otros no funcionan)

Si no encuentras forma de descargar desde Emergent:

1. Abre una terminal en Emergent (si está disponible)

2. Comprime el directorio:
   ```bash
   cd /app
   tar -czf /tmp/itsm-completo.tar.gz *
   ```

3. Descarga el archivo `/tmp/itsm-completo.tar.gz`

4. En tu servidor:
   ```bash
   cd /opt
   tar -xzf itsm-completo.tar.gz
   cd instalacion_limpia
   sudo bash instalar.sh
   ```

## 📋 Verificación

Antes de ejecutar el script, verifica que tienes estos directorios:

```bash
ls -la
# Debes ver:
# backend/
# frontend/
# instalacion_limpia/
```

## 🎬 Instalación Rápida

Una vez que tengas el código en tu servidor:

```bash
# 1. Ve al directorio de instalación
cd /ruta/donde/descargaste/instalacion_limpia

# 2. Da permisos de ejecución
chmod +x instalar.sh

# 3. Ejecuta el instalador
sudo bash instalar.sh

# 4. Espera 15-20 minutos

# 5. Accede a tu sistema
# URL: http://tu-servidor:3000
# Usuario: admin@itsm.com
# Password: admin123
```

## 💡 ¿No sabes cómo descargar desde Emergent?

Si no encuentras la opción de descarga:

1. **Contacta al soporte de Emergent** - Ellos te dirán cómo exportar tu proyecto

2. **Usa el File Browser** - Si Emergent tiene un explorador de archivos, descarga carpeta por carpeta

3. **Copia los archivos manualmente** - Como último recurso, copia y pega el contenido de cada archivo importante

## 🔍 Archivos Más Importantes

Si solo puedes copiar algunos archivos, estos son los esenciales:

**OBLIGATORIOS:**
- Todo el directorio `backend/`
- Todo el directorio `frontend/`

**MUY ÚTILES:**
- `instalacion_limpia/instalar.sh` - Script automático
- `instalacion_limpia/INSTRUCCIONES_COMPLETAS.md` - Guía manual

## ✅ Checklist Pre-Instalación

Antes de ejecutar el script, asegúrate:

- [ ] Tienes TODO el código descargado
- [ ] Estás en un servidor Ubuntu 20.04 o superior
- [ ] Tienes acceso root/sudo
- [ ] Tienes conexión a internet (para descargar dependencias)
- [ ] Los puertos 3000, 8001 y 27017 están libres

## 🆘 ¿Necesitas Ayuda?

Si no puedes descargar el código desde Emergent:

1. Lee la documentación de Emergent sobre "Export Project"
2. Contacta al soporte de Emergent
3. Intenta usar la opción "Save to GitHub"

Una vez que tengas el código, la instalación es automática con el script `instalar.sh`.

---

**¡Buena suerte con tu instalación!** 🚀
