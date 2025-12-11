# Guía de Implementación: Campos Personalizados

## ✅ Completado

### Backend
- **Endpoints creados** en `/app/backend/server.py`:
  - `GET /api/configuracion/campos/{entity_type}` - Obtener configuración
  - `PUT /api/configuracion/campos/{entity_type}` - Actualizar configuración
  - Entidades soportadas: `empresas`, `equipos`, `bitacoras`, `servicios`

### Frontend
- **Página de gestión**: `/app/frontend/src/pages/CamposPersonalizados.jsx`
- **Componente reutilizable**: `/app/frontend/src/components/CustomFieldsRenderer.jsx`
- **Integrado en**: Equipos.jsx ✅
- **Enlace agregado**: Configuracion.jsx

### Tipos de Campos Soportados
- ✅ Texto
- ✅ Número
- ✅ Fecha
- ✅ Select (con opciones configurables)
- ✅ Checkbox

## 📋 Pendiente: Integrar en otras páginas

Para integrar campos personalizados en Bitácoras, Empresas y Servicios, seguir estos pasos:

### 1. Importar el componente
```javascript
import CustomFieldsRenderer from '../components/CustomFieldsRenderer';
```

### 2. Agregar estado para custom fields
```javascript
const [customFields, setCustomFields] = useState([]);
```

### 3. Cargar configuración en useEffect
```javascript
useEffect(() => {
  fetchCustomFields();
}, []);

const fetchCustomFields = async () => {
  try {
    const response = await api.get('/configuracion/campos/{entity_type}');
    setCustomFields(response.data.campos_{entity_type} || []);
  } catch (error) {
    console.error('Error loading custom fields:', error);
  }
};
```

Donde `{entity_type}` es: `empresas`, `bitacoras`, o `servicios`

### 4. Agregar `campos_personalizados` al formData inicial
```javascript
const [formData, setFormData] = useState({
  // ... campos existentes
  campos_personalizados: {},
});
```

### 5. Agregar al formulario (dentro del Dialog/Form)
```javascript
<CustomFieldsRenderer
  customFields={customFields}
  formData={formData}
  setFormData={setFormData}
/>
```

### 6. Actualizar handleEdit para incluir campos personalizados
```javascript
const handleEdit = (item) => {
  setFormData({
    // ... campos existentes
    campos_personalizados: item.campos_personalizados || {},
  });
};
```

### 7. Actualizar resetForm
```javascript
const resetForm = () => {
  setFormData({
    // ... campos existentes
    campos_personalizados: {},
  });
};
```

## 🧪 Testing

Para probar:
1. Ir a Configuración → Campos Personalizados
2. Seleccionar una entidad
3. Agregar campos de prueba
4. Ir a la página de la entidad
5. Crear/editar un registro
6. Verificar que los campos custom aparezcan
7. Guardar y verificar que los datos se persistan

## 📝 Ejemplo de uso API

```bash
# Crear campos para bitácoras
curl -X PUT "https://smart-itsm-2.preview.emergentagent.com/api/configuracion/campos/bitacoras" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "nombre": "Prioridad",
      "tipo": "select",
      "requerido": true,
      "opciones": ["Alta", "Media", "Baja"]
    },
    {
      "nombre": "Horas Trabajadas",
      "tipo": "numero",
      "requerido": false
    }
  ]'
```

## 🔍 Verificación

Los datos de campos personalizados se almacenan en MongoDB en el campo `campos_personalizados` de cada documento como un diccionario:

```json
{
  "_id": "...",
  "nombre": "Laptop Dell",
  "campos_personalizados": {
    "Garantía Hasta": "2025-12-31",
    "Número de Licencia": "ABC-123",
    "Estado de Garantía": "Vigente"
  }
}
```
