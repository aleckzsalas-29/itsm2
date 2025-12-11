# 📅 Fecha de Revisión en Bitácoras - Documentación

## ✨ ¿Qué se implementó?

Se agregó un nuevo campo **"Fecha de Revisión"** en el módulo de Bitácoras para programar fechas de seguimiento o revisión de los mantenimientos realizados.

### Características:

✅ **Campo de Fecha en el Formulario** - Input tipo date para seleccionar fecha  
✅ **Opcional** - No es obligatorio, se puede dejar vacío  
✅ **Visible en la Tabla** - Nueva columna "F. Revisión" en el listado  
✅ **Persistencia** - Se guarda en la base de datos como `fecha_revision`  
✅ **Formato Correcto** - Conversión automática a formato ISO 8601  
✅ **Edición** - Se puede modificar al editar una bitácora existente  

---

## 🎯 Casos de Uso

### 1. **Mantenimiento Preventivo Programado**
Registrar cuándo se debe hacer el próximo mantenimiento preventivo.

**Ejemplo:**
- **Fecha de mantenimiento:** 10/12/2024
- **Fecha de revisión:** 10/01/2025 (próximo mes)
- **Tipo:** Preventivo
- **Descripción:** Limpieza general del equipo

### 2. **Seguimiento de Correctivo**
Programar una fecha para verificar que el problema se resolvió completamente.

**Ejemplo:**
- **Fecha de reparación:** 08/12/2024
- **Fecha de revisión:** 15/12/2024 (una semana después)
- **Tipo:** Correctivo
- **Descripción:** Reemplazo de disco duro

### 3. **Mantenimientos Recurrentes**
Establecer la fecha del siguiente mantenimiento periódico.

**Ejemplo:**
- **Mantenimiento actual:** 05/12/2024
- **Fecha de revisión:** 05/03/2025 (cada 3 meses)
- **Tipo:** Preventivo
- **Descripción:** Actualización de software y backup

### 4. **Control de Garantías**
Registrar cuándo vence la garantía de un componente reemplazado.

**Ejemplo:**
- **Fecha de instalación:** 10/12/2024
- **Fecha de revisión:** 10/12/2025 (fin de garantía)
- **Tipo:** Correctivo
- **Componentes:** Memoria RAM Kingston 16GB

---

## 📋 Flujo de Usuario

### Crear Nueva Bitácora con Fecha de Revisión:

1. Usuario hace clic en "Nueva Bitácora"
2. Completa los campos obligatorios (Equipo, Tipo, Descripción, etc.)
3. **Selecciona Fecha de Revisión** (opcional)
   - Click en el campo de fecha
   - Se abre el calendario
   - Selecciona la fecha deseada
4. Añade observaciones adicionales
5. Guarda la bitácora

### Editar Fecha de Revisión:

1. Usuario hace clic en el ícono de editar en una bitácora
2. Todos los datos se cargan, incluyendo la fecha de revisión
3. Puede modificar la fecha o borrarla
4. Guarda los cambios

### Ver Fechas de Revisión en el Listado:

1. En la tabla de bitácoras, la columna "F. Revisión" muestra:
   - La fecha en formato `dd/MM/yyyy` si está configurada
   - Un guion `-` si no hay fecha programada

---

## 💾 Estructura de Datos

### En la Base de Datos (MongoDB):

```json
{
  "_id": "...",
  "equipo_id": "...",
  "empresa_id": "...",
  "tipo": "Preventivo",
  "descripcion": "Mantenimiento mensual programado",
  "tecnico_id": "...",
  "fecha": "2024-12-10T14:30:00.000Z",
  "fecha_revision": "2025-01-10T00:00:00.000Z",
  "estado": "Completado",
  "observaciones": "Equipo funcionando correctamente",
  "tiempo_estimado": 60,
  "limpieza_fisica": true,
  "actualizacion_software": true,
  ...
}
```

**Notas sobre `fecha_revision`:**
- Tipo: `DateTime` (ISO 8601)
- Opcional: Puede ser `null`
- Hora: Se guarda a las 00:00:00 del día seleccionado
- Timezone: UTC

---

## 🔧 Cambios Técnicos

### Backend:

**Archivo:** `backend/models.py`

```python
class Bitacora(BaseModel):
    # ... campos existentes ...
    fecha: datetime = Field(default_factory=datetime.utcnow)
    fecha_revision: Optional[datetime] = None  # ✨ NUEVO
    estado: str = "Pendiente"
    # ... resto de campos ...
```

### Frontend:

**Archivo:** `frontend/src/pages/Bitacoras.jsx`

**1. Estado del formulario:**
```javascript
const [formData, setFormData] = useState({
  // ... campos existentes ...
  fecha_revision: '',  // ✨ NUEVO
  // ... resto de campos ...
});
```

**2. Campo en el formulario:**
```jsx
<div className="space-y-2">
  <Label htmlFor="fecha_revision">Fecha de Revisión</Label>
  <Input
    id="fecha_revision"
    type="date"
    value={formData.fecha_revision}
    onChange={(e) => setFormData({ ...formData, fecha_revision: e.target.value })}
    className="rounded-sm"
  />
  <p className="text-xs text-slate-500">Fecha programada para revisión o seguimiento</p>
</div>
```

**3. Conversión a ISO antes de enviar:**
```javascript
if (submitData.fecha_revision) {
  const fecha = new Date(submitData.fecha_revision + 'T00:00:00');
  submitData.fecha_revision = fecha.toISOString();
} else {
  submitData.fecha_revision = null;
}
```

**4. Columna en la tabla:**
```jsx
<TableHead>F. Revisión</TableHead>
// ...
<TableCell className="text-slate-600 text-sm">
  {bitacora.fecha_revision ? format(new Date(bitacora.fecha_revision), 'dd/MM/yyyy') : '-'}
</TableCell>
```

---

## 🚀 Cómo Aplicar en Producción

```bash
cd /opt/itsm

# Backup
cp backend/models.py backend/models.py.backup
cp frontend/src/pages/Bitacoras.jsx frontend/src/pages/Bitacoras.jsx.backup

# Descargar cambios
git pull origin main

# Reiniciar servicios
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend

# Verificar
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend
```

---

## ✅ Verificación

### Prueba Básica:

1. Ve a http://108.181.199.108:3000/bitacoras
2. Selecciona una empresa
3. Haz clic en "Nueva Bitácora"
4. Completa los campos obligatorios
5. **Haz clic en el campo "Fecha de Revisión"**
6. Selecciona una fecha (ej: próximo mes)
7. Guarda la bitácora
8. En la tabla, la nueva columna "F. Revisión" debe mostrar la fecha

### Prueba de Edición:

1. Haz clic en editar una bitácora con fecha de revisión
2. El campo debe mostrar la fecha guardada
3. Puedes cambiarla o borrarla
4. Guarda y verifica el cambio en la tabla

### Prueba Sin Fecha:

1. Crea una bitácora sin llenar "Fecha de Revisión"
2. Debe guardarse correctamente
3. En la tabla debe aparecer un guion `-` en la columna

---

## 📊 Interfaz Visual

### Antes (6 columnas):
```
┌──────────┬────────┬──────┬─────────────┬────────┬────────┬──────────┐
│ Fecha    │ Equipo │ Tipo │ Descripción │ Técnico│ Estado │ Acciones │
├──────────┼────────┼──────┼─────────────┼────────┼────────┼──────────┤
│10/12/24  │Laptop  │Prev. │Limpieza...  │Juan P. │Complet.│ [✏] [🗑] │
└──────────┴────────┴──────┴─────────────┴────────┴────────┴──────────┘
```

### Después (7 columnas + nuevo campo):
```
┌──────────┬────────┬──────┬─────────────┬────────┬────────┬───────────┬──────────┐
│ Fecha    │ Equipo │ Tipo │ Descripción │ Técnico│ Estado │F.Revisión │ Acciones │
├──────────┼────────┼──────┼─────────────┼────────┼────────┼───────────┼──────────┤
│10/12/24  │Laptop  │Prev. │Limpieza...  │Juan P. │Complet.│ 10/01/25  │ [✏] [🗑] │
│08/12/24  │Desktop │Corr. │Disco duro   │María G.│Complet.│ 15/12/24  │ [✏] [🗑] │
│05/12/24  │Servidor│Prev. │Actualiz...  │Carlos  │Pendien.│     -     │ [✏] [🗑] │
└──────────┴────────┴──────┴─────────────┴────────┴────────┴───────────┴──────────┘
```

### Formulario Actualizado:
```
┌─────────────────────────────────────────┐
│ Nueva Bitácora                          │
├─────────────────────────────────────────┤
│ Empresa:       [Empresa A         ▼]   │
│ Equipo:        [Laptop HP         ▼]   │
│ Tipo:          [Preventivo        ▼]   │
│ Descripción:   [___________________]   │
│ ...                                     │
│ Estado:        [Completado        ▼]   │
│                                         │
│ ✨ Fecha de Revisión:  [10/01/2025]    │
│    📅 Fecha programada para revisión    │
│                                         │
│ Tiempo Estimado: [60] minutos          │
│ Observaciones:   [___________________]  │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## 🔍 Solución de Problemas

### La fecha no se guarda

**Causa:** Error en la conversión a ISO  
**Solución:** Verifica los logs del backend:
```bash
sudo journalctl -u itsm-backend -n 50 --no-pager | grep "bitacora"
```

### La fecha aparece incorrecta (un día menos)

**Causa:** Problema de timezone  
**Solución:** Ya está resuelto. Se agrega `T00:00:00` antes de convertir a ISO para evitar problemas de zona horaria.

### La columna no aparece en la tabla

**Causa:** El frontend no se actualizó  
**Solución:**
```bash
sudo systemctl restart itsm-frontend
# Limpia caché del navegador (Ctrl + Shift + R)
```

### Error al editar bitácora antigua (sin fecha_revision)

**Causa:** Normal, bitácoras antiguas no tienen este campo  
**Solución:** No hay problema. El código maneja correctamente valores `null` o `undefined`. La columna mostrará `-` si no hay fecha.

---

## 📈 Reportes y Exportación

**Nota:** El campo `fecha_revision` se incluye automáticamente en:
- ✅ Exportación CSV de bitácoras
- ✅ Reportes PDF de bitácoras
- ✅ Reportes PDF de equipos (si la bitácora tiene fecha de revisión)

---

## 🎨 Personalización

### Cambiar el formato de fecha en la tabla:

En `frontend/src/pages/Bitacoras.jsx` línea ~375:

```javascript
// Formato actual: dd/MM/yyyy
{bitacora.fecha_revision ? format(new Date(bitacora.fecha_revision), 'dd/MM/yyyy') : '-'}

// Cambiar a otro formato:
{bitacora.fecha_revision ? format(new Date(bitacora.fecha_revision), 'dd/MM/yy') : '-'}  // 10/01/25
{bitacora.fecha_revision ? format(new Date(bitacora.fecha_revision), 'dd-MMM-yyyy') : '-'}  // 10-Ene-2025
```

### Hacer el campo obligatorio:

En `frontend/src/pages/Bitacoras.jsx` línea ~518:

```javascript
// Cambiar de:
<Input id="fecha_revision" type="date" ... />

// A:
<Input id="fecha_revision" type="date" required ... />
```

Y actualizar la etiqueta:
```javascript
<Label htmlFor="fecha_revision">Fecha de Revisión *</Label>
```

---

## 📝 Mejoras Futuras Sugeridas

1. **Notificaciones Automáticas**
   - Enviar email/notificación cuando se acerca la fecha de revisión
   - Ej: 3 días antes de la fecha programada

2. **Vista de Calendario**
   - Mostrar todas las revisiones programadas en un calendario mensual
   - Filtrar por técnico o equipo

3. **Dashboard de Revisiones Pendientes**
   - Widget mostrando las próximas revisiones de la semana
   - Contador de revisiones vencidas

4. **Estados de Revisión**
   - Campo adicional: "Revisión Completada" (checkbox)
   - Historial de revisiones realizadas

---

## 📞 Notas Importantes

- La fecha de revisión es **opcional** y no afecta la funcionalidad existente
- Las bitácoras antiguas (creadas antes de esta actualización) no tienen fecha de revisión (mostrarán `-`)
- El campo acepta cualquier fecha (pasada o futura)
- Se recomienda usar fechas futuras para programar mantenimientos
- El campo se guarda con hora 00:00:00 UTC para consistencia

---

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Archivos Modificados:**  
- `backend/models.py` (agregado campo `fecha_revision: Optional[datetime]`)  
- `frontend/src/pages/Bitacoras.jsx` (formulario + tabla + lógica)
