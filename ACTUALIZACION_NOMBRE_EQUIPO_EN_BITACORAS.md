# Actualización: Nombre de Equipo en Reportes de Bitácoras

## 📋 Resumen del Cambio

Se ha agregado el **nombre del equipo** en todos los reportes PDF de bitácoras.

### ✅ Cambios Implementados

**Reportes de Bitácoras - Todas las Plantillas:**
- **Template Moderna**: El nombre del equipo ahora aparece en la información básica de cada mantenimiento
- **Template Clásica**: Agregada columna "Equipo" en la tabla de mantenimientos
- **Template Minimalista**: El nombre del equipo aparece en la línea de resumen (Fecha • Equipo • Tipo • Estado)

## 🎯 Qué se Muestra Ahora

### Template Moderna
```
#1 - 11/12/2024 10:30 - Preventivo

Equipo: Servidor Principal
Técnico: Juan Pérez
Estado: Completado
...
```

### Template Clásica
```
| Fecha      | Equipo           | Tipo       | Técnico    | Estado     |
|------------|------------------|------------|------------|------------|
| 11/12/2024 | Servidor Princ.  | Preventivo | Juan Pérez | Completado |
```

### Template Minimalista
```
11/12/2024 • Servidor Principal • Preventivo • Completado
```

## 📁 Archivos Modificados

### Backend
- `backend/pdf_service.py`:
  - Método `_add_mantenimientos_detallados`: Agregado campo "Equipo" en información básica
  - Método `_add_mantenimientos_tabla_simple`: Agregada columna "Equipo" en tabla
  - Método `_add_mantenimientos_minimalista`: Agregado nombre del equipo en línea de resumen

- `backend/server.py`:
  - Endpoint `/bitacoras/exportar-pdf`: Agregados todos los campos de bitácora (incluido fecha_revision y campos preventivo/correctivo)

## 🚀 Instrucciones de Actualización

### Opción 1: Actualización Automática (Recomendada)

```bash
cd /opt/itsm
./actualizar_itsm.sh
```

### Opción 2: Actualización Manual

```bash
# 1. Navegar al directorio
cd /opt/itsm

# 2. Hacer backup (opcional pero recomendado)
sudo tar -czf /opt/itsm_backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/itsm

# 3. Obtener últimos cambios
git pull origin main

# 4. Reiniciar solo el backend (no es necesario reiniciar frontend)
sudo systemctl restart itsm-backend

# 5. Verificar estado
sudo systemctl status itsm-backend
```

## 🧪 Pruebas Post-Actualización

### 1. Verificar Reporte Moderna
1. Ir a **Bitácoras de Mantenimiento**
2. Seleccionar plantilla **"Moderna"**
3. Generar reporte PDF (Día, Semana o Mes)
4. **Verificar** que en cada bitácora aparezca el campo "Equipo:" con el nombre

### 2. Verificar Reporte Clásica
1. Seleccionar plantilla **"Clásica"**
2. Generar reporte PDF
3. **Verificar** que la tabla tenga una columna "Equipo"

### 3. Verificar Reporte Minimalista
1. Seleccionar plantilla **"Minimalista"**
2. Generar reporte PDF
3. **Verificar** que cada línea muestre: Fecha • Equipo • Tipo • Estado

## ✅ Verificación de Funcionamiento

```bash
# Verificar que el backend esté corriendo
sudo systemctl status itsm-backend

# Ver logs recientes (opcional)
sudo tail -50 /var/log/supervisor/itsm-backend.*.log
```

## 📊 Compatibilidad

- ✅ Compatible con todas las versiones anteriores
- ✅ No requiere cambios en la base de datos
- ✅ No afecta la funcionalidad existente
- ✅ Solo requiere reiniciar el backend (no el frontend)

## 🆘 Solución de Problemas

### Los reportes no muestran el nombre del equipo

**Solución 1: Verificar que el backend esté actualizado**
```bash
cd /opt/itsm
git log -1 --oneline
# Debe mostrar el commit más reciente con el cambio
```

**Solución 2: Reiniciar el backend**
```bash
sudo systemctl restart itsm-backend
sudo systemctl status itsm-backend
```

**Solución 3: Verificar logs**
```bash
sudo tail -100 /var/log/supervisor/itsm-backend.err.log
```

## 🔄 Rollback (Si es necesario)

```bash
# Restaurar backup
cd /opt/itsm_backups
ls -lt  # Ver backups disponibles
sudo tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /
sudo systemctl restart itsm-backend
```

## 📝 Notas Adicionales

- **Tiempo de actualización**: < 2 minutos
- **Downtime**: < 30 segundos (solo durante reinicio del backend)
- **Impacto**: Mínimo - solo mejora la información en los reportes PDF
- **Frontend**: No requiere cambios ni reinicio

## ✨ Beneficios

1. **Mayor claridad**: Ahora es fácil identificar qué equipo tiene cada mantenimiento
2. **Mejor trazabilidad**: Los reportes son más completos y útiles
3. **Consistencia**: Todas las plantillas muestran el nombre del equipo

---

**Fecha de actualización**: Diciembre 11, 2024  
**Versión**: 2.2 - Nombre de Equipo en Reportes de Bitácoras
