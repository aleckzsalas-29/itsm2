# 🚀 Instrucciones de Actualización - Sistema ITSM

## 📋 Resumen de Mejoras

Todas las funcionalidades solicitadas ya están implementadas en el código actual:

✅ **Reportes PDF completos** - Incluyen TODO el contenido del equipo y bitácora  
✅ **Campo SELECT para tipo de equipo** - Dropdown con opciones predefinidas  
✅ **Campos dinámicos** - Según tipo de equipo seleccionado  
✅ **Fecha de revisión** - En bitácoras  
✅ **Historial por equipo** - Botón azul con reloj (⏱️)  
✅ **Filtrado por empresa** - En bitácoras

---

## 🔄 Opción 1: Actualización Automática (RECOMENDADO)

### Paso 1: Hacer commit y push al repositorio GitHub

Primero, asegúrate de que el código actualizado esté en GitHub:

```bash
# En tu máquina donde tienes el código actualizado
cd /ruta/al/codigo/itsm

# Ver estado
git status

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Mejoras: Reportes PDF completos, campos dinámicos, historial por equipo"

# Subir a GitHub
git push origin main
```

### Paso 2: Actualizar en el servidor

```bash
# Conectar a tu servidor
ssh administrator@108.181.199.108

# Ir al directorio de instalación
cd /opt/itsm

# Detener servicios
sudo systemctl stop itsm-backend itsm-frontend

# Hacer backup
sudo cp -r /opt/itsm /opt/itsm_backup_$(date +%Y%m%d_%H%M%S)

# Actualizar código desde GitHub
git pull origin main

# Reiniciar servicios
sudo systemctl start itsm-backend
sleep 5
sudo systemctl start itsm-frontend

# Verificar estado
sudo systemctl status itsm-backend itsm-frontend
```

---

## 🔄 Opción 2: Actualización Manual (Si no usas Git)

### Paso 1: Descargar código actualizado

Desde la plataforma Emergent:
1. Descarga todo el proyecto actualizado
2. Descomprime el archivo

### Paso 2: Subir al servidor

```bash
# Desde tu máquina local
scp -r /ruta/codigo/actualizado/* administrator@108.181.199.108:/tmp/itsm_nuevo/
```

### Paso 3: Aplicar cambios en el servidor

```bash
# Conectar al servidor
ssh administrator@108.181.199.108

# Detener servicios
sudo systemctl stop itsm-backend itsm-frontend

# Backup
sudo cp -r /opt/itsm /opt/itsm_backup_$(date +%Y%m%d_%H%M%S)

# Copiar archivos nuevos (solo los que cambiaron)
sudo cp /tmp/itsm_nuevo/backend/server.py /opt/itsm/backend/
sudo cp /tmp/itsm_nuevo/backend/pdf_service.py /opt/itsm/backend/
sudo cp -r /tmp/itsm_nuevo/frontend/src/pages/* /opt/itsm/frontend/src/pages/

# Reinstalar dependencias del frontend (por si acaso)
cd /opt/itsm/frontend
sudo yarn install

# Reiniciar servicios
sudo systemctl start itsm-backend itsm-frontend

# Verificar
sudo systemctl status itsm-backend itsm-frontend
```

---

## 🔄 Opción 3: Script de Actualización Automático

He creado un script que hace todo automáticamente:

```bash
# En tu servidor
cd /opt/itsm

# Descargar el script de actualización
wget https://github.com/aleckzsalas-29/itsm2/raw/main/actualizar_sistema.sh

# Dar permisos
chmod +x actualizar_sistema.sh

# Ejecutar
sudo ./actualizar_sistema.sh
```

El script:
1. ✅ Crea backup automático
2. ✅ Detiene servicios
3. ✅ Actualiza código desde GitHub
4. ✅ Reinstala dependencias si es necesario
5. ✅ Reinicia servicios
6. ✅ Verifica que todo funcione

---

## ✅ Verificación Post-Actualización

### 1. Verificar Servicios

```bash
# Ver estado
sudo systemctl status itsm-backend itsm-frontend

# Ver logs si hay problemas
sudo journalctl -u itsm-backend -n 50
sudo journalctl -u itsm-frontend -n 50
```

### 2. Probar en el Navegador

Accede a: `http://108.181.199.108:3000`

**Prueba estas funcionalidades:**

#### a) Campo SELECT de Tipo de Equipo
1. Ve a **Equipos** → **Nuevo Equipo**
2. El campo "Tipo" debe ser un **dropdown** (no un input de texto)
3. Selecciona "Laptop" → Deben aparecer campos adicionales
4. Cambia a "Servidor" → Deben cambiar los campos

#### b) Botón de Historial
1. Ve a **Equipos**
2. En la tabla, busca el botón **azul con icono de reloj** (⏱️)
3. Haz click → Debe abrir un modal con el historial

#### c) Reporte PDF Completo
1. Ve a **Bitácoras**
2. Click en **"Exportar PDF Detallado"**
3. Abre el PDF generado
4. Verifica que incluye:
   - Toda la descripción completa
   - Mantenimiento preventivo
   - Diagnóstico y solución
   - Observaciones completas

#### d) Fecha de Revisión
1. Ve a **Bitácoras** → **Nueva Bitácora**
2. Busca el campo **"Fecha de Revisión"**
3. Debe existir y ser opcional

---

## 🐛 Solución de Problemas

### El frontend no muestra los cambios

```bash
# Limpiar caché y reconstruir
cd /opt/itsm/frontend
sudo rm -rf node_modules/.cache build
sudo systemctl restart itsm-frontend

# Forzar recarga en el navegador (Ctrl+Shift+R)
```

### El backend no inicia

```bash
# Ver logs completos
sudo journalctl -u itsm-backend -n 200

# Verificar dependencias
cd /opt/itsm/backend
python3 -c "import fpdf, motor, pymongo; print('OK')"

# Reinstalar si falta algo
sudo pip3 install --break-system-packages fpdf2 motor pymongo
```

### No veo el botón de historial

```bash
# Verificar que el archivo se actualizó
grep -n "History" /opt/itsm/frontend/src/pages/Equipos.jsx

# Debe aparecer la importación: import { ..., History, ... } from 'lucide-react';
```

### Los PDFs no incluyen todo el contenido

```bash
# Verificar la función en pdf_service.py
grep -A 20 "generate_bitacoras_report_detailed" /opt/itsm/backend/pdf_service.py

# Debe incluir: diagnostico_problema, solucion_aplicada, componentes_reemplazados, etc.
```

---

## 🔙 Rollback (Si algo sale mal)

Si la actualización causa problemas:

```bash
# Detener servicios
sudo systemctl stop itsm-backend itsm-frontend

# Restaurar backup
sudo rm -rf /opt/itsm
sudo mv /opt/itsm_backup_XXXXXXXX_XXXXXX /opt/itsm

# Reiniciar
sudo systemctl start itsm-backend itsm-frontend
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   ```bash
   sudo journalctl -u itsm-backend -f
   sudo journalctl -u itsm-frontend -f
   ```

2. **Verifica la versión del código:**
   ```bash
   cd /opt/itsm
   git log --oneline -5
   ```

3. **Comparte los errores** para ayudarte a resolverlos

---

## ✨ ¡Listo!

Una vez actualizado, tendrás todas las nuevas funcionalidades:
- ✅ Reportes PDF super completos
- ✅ Campos dinámicos en Equipos
- ✅ Historial visual por equipo
- ✅ Fecha de revisión en bitácoras
- ✅ Filtrado mejorado

**URL:** http://108.181.199.108:3000  
**Usuario:** admin@itsm.com  
**Password:** admin123
