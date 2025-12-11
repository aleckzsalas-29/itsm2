# 🔧 Campos Dinámicos por Tipo de Equipo - Documentación

## ✨ ¿Qué se implementó?

Se agregó funcionalidad de **campos dinámicos** que cambian según el tipo de equipo seleccionado en el formulario de Equipos.

### Características:

✅ **Dropdown de Tipo de Equipo** - El campo "Tipo" ahora es un selector con opciones predefinidas  
✅ **Carga Automática** - Al seleccionar un tipo, se cargan automáticamente los campos específicos  
✅ **12 Tipos Predefinidos** - Cada tipo tiene sus campos personalizados  
✅ **Múltiples Tipos de Campo** - Texto, número, select, checkbox  
✅ **Validación** - Campos obligatorios y opcionales  
✅ **Persistencia** - Los datos se guardan en `campos_dinamicos` del equipo  

---

## 📋 Tipos de Equipo Disponibles

### 1. **Laptop**
Campos específicos:
- Procesador* (texto)
- RAM (GB)* (número)
- Disco Duro* (texto)
- Disco Duro Capacidad (GB) (número)
- Sistema Operativo* (texto)
- Tarjeta Gráfica (texto)
- Pantalla (pulgadas) (número)
- Batería Estado (select: Excelente, Buena, Regular, Mala)

### 2. **Desktop**
Campos específicos:
- Procesador* (texto)
- RAM (GB)* (número)
- Disco Duro* (texto)
- Disco Duro Capacidad (GB) (número)
- Sistema Operativo* (texto)
- Tarjeta Gráfica (texto)
- Fuente de Poder (W) (número)
- Gabinete Tipo (texto)

### 3. **Servidor**
Campos específicos:
- Procesador* (texto)
- Núcleos CPU (número)
- RAM (GB)* (número)
- Discos* (texto)
- Configuración RAID (select: RAID 0, 1, 5, 6, 10, Sin RAID)
- Sistema Operativo* (texto)
- Servicios Activos (texto)
- IP Asignada (texto)
- Puerto Administración (texto)

### 4. **Firewall**
Campos específicos:
- Modelo* (texto)
- Firmware* (texto)
- Puertos WAN* (número)
- Puertos LAN* (número)
- IP WAN (texto)
- IP LAN (texto)
- VPN Configurado (checkbox)
- Reglas Configuradas (número)

### 5. **Switch**
Campos específicos:
- Modelo* (texto)
- Puertos Totales* (número)
- Puertos Gigabit (número)
- Puertos SFP (número)
- VLANs Configuradas (texto)
- Administrable (checkbox)
- IP Administración (texto)
- PoE (checkbox)

### 6. **Repetidor / Access Point**
Campos específicos:
- Modelo* (texto)
- Frecuencia* (select: 2.4 GHz, 5 GHz, Dual Band)
- Velocidad Máxima (Mbps) (número)
- SSID Principal (texto)
- Rango Cobertura (m) (número)
- Antenas (número)

### 7. **DVR / NVR**
Campos específicos:
- Modelo* (texto)
- Canales* (número)
- Capacidad HDD (TB)* (número)
- Resolución Grabación (select: 720p, 1080p, 4K, 5MP)
- FPS (número)
- Acceso Remoto (checkbox)
- IP Asignada (texto)

### 8. **Equipo de Red**
Campos específicos:
- Tipo* (select: Router, Access Point, Modem, Bridge, Gateway)
- Modelo* (texto)
- Firmware (texto)
- Puertos (número)
- Velocidad Máxima (Mbps) (número)
- IP Asignada (texto)

### 9-12. **Otros tipos**
- Impresora
- Scanner
- UPS / No-Break
- Otro (sin campos específicos predefinidos)

*Los campos marcados con * son obligatorios*

---

## 🎯 Flujo de Usuario

### Crear Nuevo Equipo:

1. Usuario hace clic en "Nuevo Equipo"
2. **Selecciona el Tipo** del dropdown (ej: "Laptop")
3. Los campos básicos aparecen (Nombre, Marca, Modelo, etc.)
4. **Automáticamente se cargan** los campos específicos para Laptop
5. Usuario completa los campos obligatorios (*)
6. Guarda el equipo

### Editar Equipo Existente:

1. Usuario hace clic en el ícono de editar
2. Se cargan todos los datos del equipo
3. **Se cargan automáticamente** los campos dinámicos según el tipo
4. Los valores guardados previamente aparecen prellenados
5. Usuario puede modificar y guardar

---

## 💾 Estructura de Datos

### En la Base de Datos (MongoDB):

```json
{
  "_id": "...",
  "nombre": "Laptop HP Z440",
  "tipo": "Laptop",
  "marca": "HP",
  "modelo": "Z440",
  "numero_serie": "SN123456",
  ...
  "campos_dinamicos": {
    "Procesador": "Intel Core i7-9700K",
    "RAM (GB)": "32",
    "Disco Duro": "SSD NVMe",
    "Disco Duro Capacidad (GB)": "1000",
    "Sistema Operativo": "Windows 11 Pro",
    "Tarjeta Gráfica": "NVIDIA RTX 3070",
    "Pantalla (pulgadas)": "15.6",
    "Batería Estado": "Buena"
  },
  "campos_personalizados": {
    // Campos globales configurados en Configuración
  }
}
```

---

## 🔧 Cambios Técnicos

### Backend:

**Archivo:** `backend/models.py`
- Agregado campo `campos_dinamicos: Dict[str, Any]` al modelo `Equipo`

**Archivo:** `backend/server.py`
- Endpoint ya existía: `GET /api/configuracion/campos-tipo-equipo/{tipo_equipo}`
- Retorna los campos específicos para cada tipo de equipo

### Frontend:

**Archivo:** `frontend/src/pages/Equipos.jsx`
- Campo "Tipo" convertido de `Input` a `Select` con opciones predefinidas
- Nuevo estado: `camposDinamicos`, `loadingCamposDinamicos`
- Nueva función: `fetchCamposDinamicos(tipoEquipo)`
- Renderizado dinámico de campos según tipo
- Soporte para 4 tipos de campo: texto, número, select, checkbox
- Actualizado `handleEdit` para cargar campos al editar
- Actualizado `resetForm` para limpiar campos dinámicos

---

## 🚀 Cómo Aplicar en Producción

```bash
cd /opt/itsm

# Backup
cp backend/models.py backend/models.py.backup
cp frontend/src/pages/Equipos.jsx frontend/src/pages/Equipos.jsx.backup

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

1. Ve a http://108.181.199.108:3000/equipos
2. Haz clic en "Nuevo Equipo"
3. En el campo "Tipo", selecciona "Laptop"
4. Deberías ver aparecer una sección: **"Campos Específicos para Laptop"**
5. Completa los campos obligatorios (marcados con *)
6. Guarda el equipo
7. Edita el equipo recién creado
8. Los campos específicos deben aparecer con los valores guardados

### Prueba con Diferentes Tipos:

1. Crea equipos de diferentes tipos: Desktop, Servidor, Firewall
2. Cada uno debe mostrar campos diferentes
3. Los datos deben guardarse correctamente
4. Al editar, los campos deben mostrarse con valores

---

## 📊 Ejemplo Visual

**Antes de seleccionar tipo:**
```
┌─────────────────────────────────┐
│ Nombre: [___________________]   │
│ Tipo:   [Seleccionar tipo ▼]    │
│ Marca:  [___________________]   │
│ ...                              │
└─────────────────────────────────┘
```

**Después de seleccionar "Laptop":**
```
┌─────────────────────────────────┐
│ Nombre: [___________________]   │
│ Tipo:   [Laptop            ▼]   │
│ Marca:  [___________________]   │
│ ...                              │
│                                  │
│ ═══ Campos Específicos para     │
│     Laptop ═══                   │
│                                  │
│ Procesador*: [_______________]  │
│ RAM (GB)*:   [_______________]  │
│ Disco Duro*: [_______________]  │
│ ...                              │
└─────────────────────────────────┘
```

---

## 🔍 Solución de Problemas

### Los campos dinámicos no aparecen

**Causa 1:** El tipo no está en minúsculas en la BD  
**Solución:** El endpoint convierte automáticamente a minúsculas

**Causa 2:** Error de red al cargar campos  
**Solución:** Verifica logs del backend:
```bash
sudo journalctl -u itsm-backend -n 50 --no-pager | grep "campos-tipo"
```

### Los campos no se guardan

**Causa:** El modelo de Equipo no tiene `campos_dinamicos`  
**Solución:** Verifica que se aplicó el cambio en `backend/models.py`

### Error al seleccionar tipo

**Causa:** El frontend no compiló correctamente  
**Solución:**
```bash
sudo journalctl -u itsm-frontend -n 50 --no-pager
```

---

## 🎨 Personalización

### Agregar un Nuevo Tipo de Equipo:

**Backend** (`backend/server.py` línea 950):
```python
campos_por_tipo = {
    # ... tipos existentes ...
    "nuevo_tipo": [
        {"nombre": "Campo 1", "tipo": "texto", "requerido": True},
        {"nombre": "Campo 2", "tipo": "numero", "requerido": False},
        {"nombre": "Campo 3", "tipo": "select", 
         "opciones": ["Opción 1", "Opción 2"], "requerido": False},
        {"nombre": "Campo 4", "tipo": "checkbox", "requerido": False}
    ]
}
```

**Frontend** (`frontend/src/pages/Equipos.jsx` línea 420):
```jsx
<SelectContent>
  {/* ... opciones existentes ... */}
  <SelectItem value="Nuevo_Tipo">Nuevo Tipo</SelectItem>
</SelectContent>
```

**Importante:** El valor en el Select debe coincidir con la clave en minúsculas del backend.

---

## 📝 Notas Importantes

- Los campos dinámicos son **adicionales** a los campos base del equipo
- Los campos personalizados (configurados globalmente) siguen funcionando
- Los campos obligatorios (*) validan en el frontend
- Los datos se guardan en `campos_dinamicos`, separados de `campos_personalizados`
- El endpoint del backend maneja tipos en minúsculas automáticamente

---

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Archivos Modificados:**  
- `backend/models.py` (agregado campo `campos_dinamicos`)  
- `frontend/src/pages/Equipos.jsx` (dropdown + renderizado dinámico)
