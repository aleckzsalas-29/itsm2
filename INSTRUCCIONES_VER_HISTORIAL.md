# 📋 Instrucciones: Agregar Funcionalidad "Ver Historial"

## ✨ ¿Qué hace esta actualización?

Esta actualización agrega un botón azul con ícono de historial (reloj) en cada equipo de la tabla. Al hacer clic en este botón, se abrirá un modal que muestra todo el historial de mantenimientos (bitácoras) asociadas a ese equipo específico.

## 🎯 Características incluidas:

- ✅ Botón azul "Ver Historial" en cada fila de equipos
- ✅ Modal con lista completa de todas las bitácoras del equipo
- ✅ Muestra: Fecha, Técnico, Tipo de Servicio, Estado, Descripción y Observaciones
- ✅ Ordenado por fecha (más reciente primero)
- ✅ Indicador de carga mientras obtiene los datos
- ✅ Mensaje cuando no hay historial disponible

---

## 🚀 Método 1: Script Automático (RECOMENDADO)

### Paso 1: Copiar el script a tu servidor

Copia el archivo `agregar_historial_produccion.py` a tu servidor en `/opt/itsm/`:

```bash
# En tu servidor vps-logbook
cd /opt/itsm
# Copia el contenido del script aquí o usa scp/wget
```

### Paso 2: Ejecutar el script

```bash
cd /opt/itsm
python3 agregar_historial_produccion.py
```

El script hará lo siguiente:
1. Creará un backup automático del archivo actual
2. Agregará todos los cambios necesarios
3. Te mostrará el progreso de cada paso

### Paso 3: Reiniciar el frontend

```bash
pm2 restart frontend
```

### Paso 4: Verificar en el navegador

1. Abre http://108.181.199.108:3000/equipos
2. Verás un botón azul con ícono de reloj en cada equipo
3. Haz clic en el botón para ver el historial

---

## 📝 Método 2: Actualización Manual

Si prefieres hacerlo manualmente o el script automático no funciona:

### 1. Crear backup

```bash
cd /opt/itsm
cp frontend/src/pages/Equipos.jsx frontend/src/pages/Equipos.jsx.backup_$(date +%Y%m%d)
```

### 2. Copiar el archivo actualizado

Opción A - Desde este repositorio:
```bash
# Copia el archivo Equipos.jsx actualizado desde /app/frontend/src/pages/Equipos.jsx
# a /opt/itsm/frontend/src/pages/Equipos.jsx
```

Opción B - Usar git (si tienes acceso):
```bash
cd /opt/itsm
git checkout <branch-con-cambios> -- frontend/src/pages/Equipos.jsx
```

### 3. Reiniciar frontend

```bash
pm2 restart frontend
```

---

## 🔍 Verificación

Después de aplicar los cambios, verifica:

1. **El frontend compila sin errores:**
   ```bash
   pm2 logs frontend --lines 50
   ```
   Debe decir "webpack compiled successfully"

2. **El botón aparece en la interfaz:**
   - Navega a la página de Equipos
   - Deberías ver 3 botones en la columna "Acciones":
     - 🔵 Botón azul (Ver Historial) - NUEVO
     - ✏️ Botón gris (Editar)
     - 🗑️ Botón rojo (Eliminar)

3. **El modal funciona:**
   - Haz clic en el botón azul de historial
   - Debe aparecer un modal con el título "Historial de Mantenimientos - [Nombre del Equipo]"
   - Si hay bitácoras, se mostrarán en tarjetas
   - Si no hay bitácoras, mostrará "No hay registros de mantenimiento para este equipo"

---

## ⚠️ Solución de Problemas

### Error: "Module not found" o "Cannot find module"

```bash
cd /opt/itsm/frontend
npm install
# o si usas yarn:
yarn install
pm2 restart frontend
```

### El modal no aparece o aparece vacío

1. Verifica que haya bitácoras en la base de datos:
   ```bash
   mongo
   use itsm_database
   db.bitacoras.count()
   db.bitacoras.find().pretty()
   ```

2. Verifica los logs del navegador (F12 > Console)

3. Verifica los logs del backend:
   ```bash
   pm2 logs backend --lines 50
   ```

### El botón no aparece

1. Verifica que el archivo se actualizó correctamente:
   ```bash
   grep -n "historialOpen" /opt/itsm/frontend/src/pages/Equipos.jsx
   ```
   Debería mostrar varias líneas con "historialOpen"

2. Limpia la caché del navegador (Ctrl + Shift + R)

### Revertir cambios

Si algo sale mal, restaura el backup:
```bash
cd /opt/itsm
cp frontend/src/pages/Equipos.jsx.backup_* frontend/src/pages/Equipos.jsx
pm2 restart frontend
```

---

## 📚 Cambios Técnicos Realizados

Para referencia técnica, estos son los cambios aplicados:

1. **Import del ícono History** de lucide-react
2. **4 nuevos estados:**
   - `historialOpen`: controla si el modal está abierto
   - `historialData`: almacena las bitácoras del equipo
   - `loadingHistorial`: indica si está cargando datos
   - `selectedEquipoNombre`: nombre del equipo seleccionado

3. **Función `fetchHistorial`:** Obtiene bitácoras del endpoint `/api/bitacoras?equipo_id=...`

4. **Botón azul** con ícono History en la columna de acciones

5. **Modal Dialog** con:
   - Header con nombre del equipo
   - Lista de bitácoras con formato de tarjetas
   - Campos: Fecha, Técnico, Tipo, Estado, Descripción, Observaciones
   - Botón Cerrar

---

## 📞 Soporte

Si tienes problemas con la actualización:
1. Verifica los logs con `pm2 logs frontend`
2. Revisa la consola del navegador (F12)
3. Asegúrate de que el endpoint `/api/bitacoras` funcione correctamente

---

**Versión:** 1.0  
**Fecha:** Diciembre 2024
**Archivo modificado:** `frontend/src/pages/Equipos.jsx`
