import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

/**
 * Componente reutilizable para renderizar campos personalizados dinámicos
 * @param {Array} customFields - Array de configuración de campos personalizados
 * @param {Object} formData - Objeto del formulario actual
 * @param {Function} setFormData - Función para actualizar el estado del formulario
 * @param {String} dataKey - Clave donde se almacenan los campos personalizados (default: 'campos_personalizados')
 */
export default function CustomFieldsRenderer({ customFields, formData, setFormData, dataKey = 'campos_personalizados' }) {
  if (!customFields || customFields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [dataKey]: {
        ...formData[dataKey],
        [fieldName]: value
      }
    });
  };

  return (
    <div className="col-span-2 border-t border-slate-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
        Campos Personalizados
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {customFields.map((campo, index) => {
          const currentValue = formData[dataKey]?.[campo.nombre];

          return (
            <div key={index} className={campo.tipo === 'checkbox' ? 'flex items-center space-x-2' : 'space-y-2'}>
              {campo.tipo === 'texto' && (
                <>
                  <Label htmlFor={`custom_${campo.nombre}`}>
                    {campo.nombre} {campo.requerido && '*'}
                  </Label>
                  <Input
                    id={`custom_${campo.nombre}`}
                    value={currentValue || ''}
                    onChange={(e) => handleFieldChange(campo.nombre, e.target.value)}
                    required={campo.requerido}
                    className="rounded-sm"
                    placeholder={campo.descripcion}
                  />
                </>
              )}

              {campo.tipo === 'numero' && (
                <>
                  <Label htmlFor={`custom_${campo.nombre}`}>
                    {campo.nombre} {campo.requerido && '*'}
                  </Label>
                  <Input
                    id={`custom_${campo.nombre}`}
                    type="number"
                    value={currentValue || ''}
                    onChange={(e) => handleFieldChange(campo.nombre, e.target.value)}
                    required={campo.requerido}
                    className="rounded-sm"
                    placeholder={campo.descripcion}
                  />
                </>
              )}

              {campo.tipo === 'fecha' && (
                <>
                  <Label htmlFor={`custom_${campo.nombre}`}>
                    {campo.nombre} {campo.requerido && '*'}
                  </Label>
                  <Input
                    id={`custom_${campo.nombre}`}
                    type="date"
                    value={currentValue || ''}
                    onChange={(e) => handleFieldChange(campo.nombre, e.target.value)}
                    required={campo.requerido}
                    className="rounded-sm"
                  />
                </>
              )}

              {campo.tipo === 'select' && (
                <>
                  <Label htmlFor={`custom_${campo.nombre}`}>
                    {campo.nombre} {campo.requerido && '*'}
                  </Label>
                  <Select
                    value={currentValue || ''}
                    onValueChange={(value) => handleFieldChange(campo.nombre, value)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.opciones?.map((opcion, idx) => (
                        <SelectItem key={idx} value={opcion}>
                          {opcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {campo.tipo === 'checkbox' && (
                <>
                  <Checkbox
                    id={`custom_${campo.nombre}`}
                    checked={currentValue || false}
                    onCheckedChange={(checked) => handleFieldChange(campo.nombre, checked)}
                  />
                  <Label htmlFor={`custom_${campo.nombre}`} className="font-normal cursor-pointer">
                    {campo.nombre} {campo.requerido && '*'}
                  </Label>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
