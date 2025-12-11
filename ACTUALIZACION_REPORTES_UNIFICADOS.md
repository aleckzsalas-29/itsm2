# Actualización: Reportes Unificados con Plantillas

## 📋 Resumen de Cambios

Esta actualización implementa las características finales del sistema de reportes:

### ✅ Reportes de Empresa
- **Historial completo de mantenimientos**: Ahora los reportes de empresa incluyen el historial detallado de mantenimientos de cada equipo
- Disponible en las 3 plantillas: Moderna, Clásica y Minimalista

### ✅ Reportes de Bitácoras
- **Selector de plantillas**: Los reportes de bitácoras ahora tienen las mismas opciones de diseño que los demás reportes
- **3 plantillas disponibles**:
  - **Moderna**: Diseño con bloques de colores, íconos y diseño atractivo
  - **Clásica**: Formato tradicional con tablas y bordes
  - **Minimalista**: Diseño limpio con espacios amplios

## 🎯 Características Implementadas

### 1. Reportes de Empresa Mejorados
Todos los templates (Moderna, Clásica, Minimalista) ahora incluyen:
- Información completa de la empresa
- Lista detallada de todos los equipos
- **HISTORIAL COMPLETO** de mantenimientos por cada equipo
- Especificaciones técnicas de cada equipo
- Campos dinámicos personalizados

### 2. Reportes de Bitácoras con Plantillas
Nueva funcionalidad en la página de Bitácoras:
- Selector desplegable de plantilla antes de generar el PDF
- Mantiene el filtro por período (Día, Semana, Mes)
- Genera reportes con el estilo visual seleccionado

## 📁 Archivos Modificados

### Backend
- `backend/pdf_service.py`: 
  - Corregido método `_add_mantenimientos_detallados` en reportes de empresa
  - Agregados templates clásico y minimalista para reportes de empresa con historial
  - Refactorizada función `generate_bitacoras_report` para soportar templates
  - Agregados 3 métodos nuevos: `_generar_bitacoras_moderno`, `_generar_bitacoras_clasico`, `_generar_bitacoras_minimalista`
  
- `backend/server.py`:
  - Actualizado endpoint `/bitacoras/exportar-pdf` para aceptar parámetro `template`

### Frontend
- `frontend/src/pages/Bitacoras.jsx`:
  - Agregado estado `selectedTemplate`
  - Agregado selector desplegable de plantillas en sección de exportación
  - Actualizada función `handleExportPDF` para enviar el template seleccionado

## 🚀 Instrucciones de Actualización

### Opción 1: Actualización Automática (Recomendada)

Ejecuta el script de actualización desde tu servidor de producción:

```bash
cd /opt/itsm
./actualizar_itsm.sh
```

El script hará automáticamente:
1. ✅ Crear backup completo del sistema actual
2. ✅ Hacer pull de los últimos cambios desde git
3. ✅ Instalar/actualizar dependencias (si es necesario)
4. ✅ Reiniciar servicios frontend y backend
5. ✅ Verificar que todo funcione correctamente

### Opción 2: Actualización Manual

Si prefieres hacerlo manualmente:

```bash
# 1. Navegar al directorio
cd /opt/itsm

# 2. Hacer backup manual (recomendado)
sudo mkdir -p /opt/itsm_backups
sudo tar -czf /opt/itsm_backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/itsm

# 3. Obtener últimos cambios
git pull origin main

# 4. Reiniciar servicios
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend

# 5. Verificar estado
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
```

## 🧪 Pruebas Post-Actualización

### 1. Probar Reporte de Empresa con Historial
1. Ir a **Reportes** → **Reporte por Empresa**
2. Seleccionar una empresa
3. Seleccionar cualquier plantilla (Moderna, Clásica, Minimalista)
4. Generar reporte
5. **Verificar** que el PDF incluya:
   - Información de la empresa
   - Lista de equipos con todas sus especificaciones
   - **Historial completo de mantenimientos de cada equipo**

### 2. Probar Reporte de Bitácoras con Plantillas
1. Ir a **Bitácoras de Mantenimiento**
2. Seleccionar una empresa
3. **Seleccionar plantilla** en el dropdown "Plantilla PDF:"
4. Hacer clic en cualquier botón PDF (Día, Semana, Mes)
5. **Verificar** que el PDF se genere con el estilo visual seleccionado

### 3. Verificar las 3 Plantillas
Genera un reporte con cada plantilla y verifica:

- **Moderna**: Bloques con colores, íconos coloridos, diseño visual atractivo
- **Clásica**: Tablas con bordes, formato tradicional y formal
- **Minimalista**: Espacios amplios, diseño limpio y simple

## ✅ Verificación de Funcionamiento

Después de actualizar, verifica:

```bash
# Verificar que los servicios estén corriendo
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend

# Ver logs del backend para asegurar que no hay errores
sudo tail -f /var/log/supervisor/itsm-backend.*.log

# Ver logs del frontend
sudo tail -f /var/log/supervisor/itsm-frontend.*.log
```

## 📊 Compatibilidad

- ✅ Compatible con todas las versiones anteriores del sistema
- ✅ No requiere cambios en la base de datos
- ✅ No afecta funcionalidades existentes
- ✅ Los reportes antiguos siguen funcionando

## 🆘 Solución de Problemas

### Error: "No se genera el reporte"
```bash
# Verificar logs del backend
sudo tail -100 /var/log/supervisor/itsm-backend.err.log

# Reiniciar servicio backend
sudo systemctl restart itsm-backend
```

### Error: "No se ve el selector de plantillas en Bitácoras"
```bash
# Limpiar caché del navegador
# O hacer Ctrl + Shift + R (hard refresh)

# Reiniciar frontend
sudo systemctl restart itsm-frontend
```

### Error: "Git pull falla por conflictos"
```bash
# Ver archivos en conflicto
git status

# Opción 1: Guardar cambios locales
git stash
git pull origin main
git stash pop

# Opción 2: Descartar cambios locales (CUIDADO)
git reset --hard origin/main
```

## 🔄 Rollback (Si algo sale mal)

Si necesitas volver a la versión anterior:

```bash
# Opción 1: Usar script de rollback
cd /opt/itsm
./rollback_itsm.sh

# Opción 2: Restaurar backup manual
cd /opt/itsm_backups
# Buscar el backup más reciente
ls -lt

# Restaurar (ajustar nombre del archivo)
sudo tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /
sudo systemctl restart itsm-backend itsm-frontend
```

## 📝 Notas Adicionales

- **Tiempo estimado de actualización**: 2-5 minutos
- **Downtime esperado**: < 1 minuto (durante reinicio de servicios)
- **Backup automático**: El script `actualizar_itsm.sh` crea un backup antes de actualizar

## 📞 Soporte

Si tienes problemas durante la actualización:
1. Revisa los logs del sistema
2. Consulta la sección de Solución de Problemas
3. Haz rollback si es necesario
4. Documenta el error para análisis posterior

---

**Fecha de actualización**: Diciembre 11, 2024
**Versión**: 2.1 - Reportes Unificados
