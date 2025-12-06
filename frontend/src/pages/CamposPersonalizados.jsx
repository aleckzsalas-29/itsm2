import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Save, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';

export default function CamposPersonalizados() {
  const [entityType, setEntityType] = useState('equipos');
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'texto',
    requerido: false,
    opciones: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchCampos();
  }, [entityType]);

  const fetchCampos = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/configuracion/campos/${entityType}`);
      const fieldName = `campos_${entityType}`;
      setCampos(response.data[fieldName] || []);
    } catch (error) {
      toast.error('Error al cargar campos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validar nombre único
      const nombreExists = campos.some((campo, idx) => 
        campo.nombre === formData.nombre && idx !== editingIndex
      );
      
      if (nombreExists) {
        toast.error('Ya existe un campo con ese nombre');
        return;
      }

      const newCampo = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        requerido: formData.requerido,
        descripcion: formData.descripcion || ''
      };

      // Agregar opciones si es tipo select
      if (formData.tipo === 'select') {
        if (!formData.opciones.trim()) {
          toast.error('Debes agregar opciones para el campo tipo Select');
          return;
        }
        newCampo.opciones = formData.opciones.split(',').map(opt => opt.trim()).filter(opt => opt);
      }

      let updatedCampos = [...campos];
      if (editingIndex !== null) {
        updatedCampos[editingIndex] = newCampo;
      } else {
        updatedCampos.push(newCampo);
      }

      setSaving(true);
      await api.put(`/configuracion/campos/${entityType}`, updatedCampos);
      toast.success('Campos actualizados exitosamente');
      setCampos(updatedCampos);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar campo'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm('¿Estás seguro de eliminar este campo?')) {
      try {
        const updatedCampos = campos.filter((_, idx) => idx !== index);
        await api.put(`/configuracion/campos/${entityType}`, updatedCampos);
        toast.success('Campo eliminado exitosamente');
        setCampos(updatedCampos);
      } catch (error) {
        toast.error('Error al eliminar campo');
      }
    }
  };

  const handleEdit = (campo, index) => {
    setEditingIndex(index);
    setFormData({
      nombre: campo.nombre,
      tipo: campo.tipo,
      requerido: campo.requerido || false,
      opciones: campo.opciones ? campo.opciones.join(', ') : '',
      descripcion: campo.descripcion || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'texto',
      requerido: false,
      opciones: '',
      descripcion: ''
    });
    setEditingIndex(null);
  };

  const entityNames = {
    'empresas': 'Empresas',
    'equipos': 'Equipos',
    'bitacoras': 'Bitácoras',
    'servicios': 'Servicios'
  };

  const tipoNames = {
    'texto': 'Texto',
    'numero': 'Número',
    'fecha': 'Fecha',
    'select': 'Selección (Select)',
    'checkbox': 'Casilla (Checkbox)'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Campos Personalizados
        </h1>
        <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Personaliza los campos de cada entidad del sistema
        </p>
      </div>

      <Card className="border border-slate-200 shadow-none rounded-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <Settings2 className="inline mr-2 h-5 w-5 text-blue-600" />
                Configurar Campos
              </CardTitle>
              <CardDescription>Selecciona una entidad y gestiona sus campos personalizados</CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Campo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="entity-select" className="min-w-fit">Entidad:</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="w-64 rounded-sm border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(entityNames).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {campos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-sm border border-slate-200">
                  <Settings2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600">No hay campos personalizados configurados</p>
                  <p className="text-sm text-slate-500 mt-1">Haz clic en "Agregar Campo" para crear uno</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Nombre del Campo</TableHead>
                        <TableHead className="font-semibold">Tipo</TableHead>
                        <TableHead className="font-semibold">Requerido</TableHead>
                        <TableHead className="font-semibold">Opciones</TableHead>
                        <TableHead className="font-semibold text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campos.map((campo, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{campo.nombre}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tipoNames[campo.tipo]}
                            </span>
                          </TableCell>
                          <TableCell>
                            {campo.requerido ? (
                              <span className="text-green-600 font-medium">Sí</span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {campo.tipo === 'select' && campo.opciones ? (
                              <span className="text-sm text-slate-600">{campo.opciones.join(', ')}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(campo, index)}
                              className="mr-2 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(index)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {editingIndex !== null ? 'Editar Campo' : 'Nuevo Campo Personalizado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Campo*</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Garantía Hasta"
                className="rounded-sm border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Campo*</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger className="rounded-sm border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoNames).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.tipo === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="opciones">Opciones (separadas por comas)*</Label>
                <Input
                  id="opciones"
                  value={formData.opciones}
                  onChange={(e) => setFormData({ ...formData, opciones: e.target.value })}
                  placeholder="Ej: Opción 1, Opción 2, Opción 3"
                  className="rounded-sm border-slate-300"
                />
                <p className="text-xs text-slate-500">Separa cada opción con una coma</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del campo"
                className="rounded-sm border-slate-300"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requerido"
                checked={formData.requerido}
                onCheckedChange={(checked) => setFormData({ ...formData, requerido: checked })}
              />
              <Label htmlFor="requerido" className="font-normal cursor-pointer">
                Campo requerido
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              className="rounded-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.nombre.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
