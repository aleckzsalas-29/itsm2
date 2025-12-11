# 🔄 Optimización de Campos en Equipos

## 📋 Resumen de Cambios

Se reemplazaron los campos duplicados del formulario de Equipos por campos únicos y más útiles para la gestión de activos de TI.

---

## ❌ Campos Eliminados (Duplicados)

Estos campos se eliminaron porque ya están cubiertos por los **campos dinámicos** según el tipo de equipo:

| Campo Eliminado | Razón |
|----------------|-------|
| Procesador | Ya está en campos dinámicos (Laptop, Desktop, Servidor) |
| Memoria RAM | Ya está en campos dinámicos (Laptop, Desktop, Servidor) |
| Disco Duro | Ya está en campos dinámicos (Laptop, Desktop, Servidor) |
| Espacio Disponible | Redundante con Disco Duro |
| Componentes Adicionales | Información muy general, mejor usar campos específicos |

---

## ✅ Campos Nuevos Agregados

### 1. **Fecha de Compra** 📅
- **Tipo:** Date
- **Propósito:** Registrar cuándo se adquirió el equipo
- **Utilidad:** 
  - Control de inventario
  - Cálculo de depreciación
  - Historial de adquisiciones

### 2. **Garantía Hasta** 📅
- **Tipo:** Date
- **Propósito:** Fecha de vencimiento de la garantía
- **Utilidad:**
  - Alertas antes de vencimiento
  - Control de reparaciones cubiertas
  - Planificación de renovaciones

### 3. **Proveedor** 🏢
- **Tipo:** Texto
- **Propósito:** Nombre del proveedor o distribuidor
- **Utilidad:**
  - Contacto para soporte
  - Gestión de relaciones con proveedores
  - Historial de compras

### 4. **Valor de Compra** 💰
- **Tipo:** Texto
- **Propósito:** Precio o valor del equipo
- **Utilidad:**
  - Control de activos
  - Cálculo de inversiones
  - Seguros y pólizas

### 5. **Dirección MAC** 🔌
- **Tipo:** Texto (formato: XX:XX:XX:XX:XX:XX)
- **Propósito:** MAC Address del equipo
- **Utilidad:**
  - Identificación única en red
  - Control de acceso (MAC filtering)
  - Troubleshooting de red

### 6. **Dirección IP** 🌐
- **Tipo:** Texto (formato: XXX.XXX.XXX.XXX)
- **Propósito:** IP asignada al equipo
- **Utilidad:**
  - Acceso remoto
  - Mapeo de red
  - Diagnóstico de conexiones

### 7. **Hostname** 💻
- **Tipo:** Texto
- **Propósito:** Nombre del host en la red
- **Utilidad:**
  - Identificación en red
  - DNS y resolución de nombres
  - Administración remota

### 8. **Sistema Operativo** 🖥️
- **Tipo:** Texto
- **Propósito:** SO instalado en el equipo
- **Utilidad:**
  - Control de licencias
  - Compatibilidad de software
  - Actualizaciones y parches

---

## 📊 Comparación Antes vs. Después

### Antes (Campos Básicos):
```
┌─────────────────────────────────────────┐
│ Nombre, Tipo, Marca, Modelo, Serie     │
│ Procesador                              │  ⚠️ Duplicado
│ Memoria RAM                             │  ⚠️ Duplicado
│ Disco Duro                              │  ⚠️ Duplicado
│ Espacio Disponible                      │  ⚠️ Redundante
│ Componentes Adicionales                 │  ⚠️ Muy general
│ Usuario Windows                         │
│ Contraseña Windows                      │
│ Correo Usuario                          │
│ Contraseña Correo                       │
│ Ubicación, Estado                       │
│ Notas                                   │
└─────────────────────────────────────────┘
```

### Después (Campos Optimizados):
```
┌─────────────────────────────────────────┐
│ Nombre, Tipo, Marca, Modelo, Serie     │
│ Fecha de Compra          📅 ✨ NUEVO   │
│ Garantía Hasta           📅 ✨ NUEVO   │
│ Proveedor                🏢 ✨ NUEVO   │
│ Valor de Compra          💰 ✨ NUEVO   │
│ Dirección MAC            🔌 ✨ NUEVO   │
│ Dirección IP             🌐 ✨ NUEVO   │
│ Hostname                 💻 ✨ NUEVO   │
│ Sistema Operativo        🖥️ ✨ NUEVO   │
│ Usuario Windows                         │
│ Contraseña Windows                      │
│ Correo Usuario                          │
│ Contraseña Correo                       │
│ Ubicación, Estado                       │
│ Notas                                   │
└─────────────────────────────────────────┘

+ Campos Dinámicos según Tipo seleccionado
  (Procesador, RAM, Disco, etc.)
```

---

## 🎯 Ventajas de los Nuevos Campos

### Gestión Financiera
- Control de inversiones en equipos
- Cálculo de depreciación
- Presupuestos y costos

### Gestión de Garantías
- Alertas de vencimiento
- Historial de reparaciones cubiertas
- Renovaciones planificadas

### Gestión de Red
- Mapeo completo de red
- Troubleshooting facilitado
- Control de accesos

### Gestión de Proveedores
- Contactos centralizados
- Historial de compras
- Relaciones comerciales

---

## 🔧 Cambios Técnicos

### Backend (`backend/models.py`):

**Campos eliminados:**
```python
memoria_ram: Optional[str] = None
disco_duro: Optional[str] = None
espacio_disponible: Optional[str] = None
procesador: Optional[str] = None
componentes: Optional[str] = None
```

**Campos agregados:**
```python
fecha_compra: Optional[str] = None
garantia_hasta: Optional[str] = None
proveedor: Optional[str] = None
valor_compra: Optional[str] = None
direccion_mac: Optional[str] = None
direccion_ip: Optional[str] = None
hostname: Optional[str] = None
sistema_operativo: Optional[str] = None
```

### Frontend (`frontend/src/pages/Equipos.jsx`):

**Nuevos inputs:**
- 2 inputs de tipo `date` (Fecha de Compra, Garantía Hasta)
- 6 inputs de tipo `text` (Proveedor, Valor, MAC, IP, Hostname, SO)
- Formato especial para MAC, IP y Hostname (font-mono)

---

## 🚀 Aplicar en Producción

```bash
cd /opt/itsm
git pull origin main
sudo systemctl restart itsm-backend
sudo systemctl restart itsm-frontend
```

**Tiempo estimado:** 2-3 minutos

---

## ✅ Verificación

### Crear Nuevo Equipo:

1. Ve a http://108.181.199.108:3000/equipos
2. Haz clic en "Nuevo Equipo"
3. Verifica que aparecen los nuevos campos:
   - ✅ Fecha de Compra (date picker)
   - ✅ Garantía Hasta (date picker)
   - ✅ Proveedor
   - ✅ Valor de Compra
   - ✅ Dirección MAC
   - ✅ Dirección IP
   - ✅ Hostname
   - ✅ Sistema Operativo
4. **NO** deberían aparecer:
   - ❌ Procesador (ahora en campos dinámicos)
   - ❌ Memoria RAM (ahora en campos dinámicos)
   - ❌ Disco Duro (ahora en campos dinámicos)
   - ❌ Espacio Disponible
   - ❌ Componentes Adicionales

### Verificar Campos Dinámicos:

1. Selecciona tipo "Laptop"
2. Deberías ver la sección "Campos Específicos para Laptop"
3. Con campos: Procesador, RAM, Disco Duro, Sistema Operativo, etc.

---

## 📊 Ejemplo de Uso

### Laptop de Oficina:

**Campos Básicos:**
- Nombre: Laptop Contabilidad 01
- Tipo: Laptop
- Marca: HP
- Modelo: EliteBook 840 G8
- Serie: 5CD1234ABC

**Nuevos Campos:**
- Fecha de Compra: 15/06/2023
- Garantía Hasta: 15/06/2026 (3 años)
- Proveedor: TechStore México
- Valor de Compra: $25,000.00 MXN
- Dirección MAC: A4:5E:60:F2:3A:B1
- Dirección IP: 192.168.1.105
- Hostname: LAPTOP-CONTA-01
- Sistema Operativo: Windows 11 Pro

**Campos Dinámicos (Laptop):**
- Procesador: Intel Core i7-1185G7
- RAM (GB): 16
- Disco Duro: SSD NVMe 512GB
- Tarjeta Gráfica: Intel Iris Xe
- Pantalla (pulgadas): 14
- Batería Estado: Excelente

---

## 🔍 Migración de Datos

### Equipos Existentes:

Los equipos creados con los campos antiguos **NO perderán** información:

- Los valores de `procesador`, `memoria_ram`, `disco_duro` se mantienen en la BD
- Puedes acceder a ellos vía API si es necesario
- Los campos dinámicos pueden completarse editando el equipo
- Los nuevos campos estarán vacíos hasta que se completen

### Script de Migración (Opcional):

Si quieres migrar datos automáticamente:

```javascript
// Ejemplo: Migrar procesador a campos dinámicos
equipos.forEach(async (equipo) => {
  if (equipo.procesador && equipo.tipo === 'Laptop') {
    equipo.campos_dinamicos = {
      ...equipo.campos_dinamicos,
      'Procesador': equipo.procesador
    };
    await api.put(`/equipos/${equipo._id}`, equipo);
  }
});
```

---

## 📝 Notas Importantes

1. **Compatibilidad:** Los equipos antiguos siguen funcionando
2. **Campos Dinámicos:** Especificaciones técnicas ahora van ahí
3. **Sin Pérdida de Datos:** Los valores antiguos se mantienen en BD
4. **Reportes PDF:** Ya incluyen los nuevos campos automáticamente
5. **Formato de Fechas:** YYYY-MM-DD en BD, dd/MM/yyyy en UI

---

## 🎨 Mejoras de UX

- **Campos de Fecha:** Date picker nativo del navegador
- **MAC e IP:** Formato monoespaciado para mejor legibilidad
- **Hostname:** Formato monoespaciado (código)
- **Placeholders:** Ejemplos claros de formato esperado
- **Agrupación Lógica:** Campos relacionados juntos

---

## 📞 Preguntas Frecuentes

**P: ¿Qué pasa con los equipos que ya tienen procesador/RAM/disco?**  
R: Los datos se mantienen en la base de datos. Puedes migrarlos a campos dinámicos editando el equipo.

**P: ¿Los reportes PDF mostrarán los nuevos campos?**  
R: Sí, automáticamente. Los PDFs ya están actualizados.

**P: ¿Puedo agregar más campos personalizados?**  
R: Sí, usa la configuración de campos personalizados o agrega más campos dinámicos.

**P: ¿Necesito llenar todos los campos nuevos?**  
R: No, todos son opcionales. Completa solo los que necesites.

---

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Archivos Modificados:**  
- `backend/models.py`  
- `frontend/src/pages/Equipos.jsx`
