import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Bitacoras() {
  const { user } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBitacora, setEditingBitacora] = useState(null);
  const [formData, setFormData] = useState({
    empresa_id: '',
    equipo_id: '',
    tipo: '',
    descripcion: '',
    tecnico_id: user?._id || '',
    estado: 'Pendiente',
    observaciones: '',
    costo: '',
    tiempo_estimado: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bitacorasRes, empresasRes, equiposRes, usuariosRes] = await Promise.all([
        api.get('/bitacoras'),
        api.get('/empresas'),
        api.get('/equipos'),
        api.get('/usuarios')
      ]);
      setBitacoras(bitacorasRes.data);
      setEmpresas(empresasRes.data);
      setEquipos(equiposRes.data);
      setTecnicos(usuariosRes.data.filter(u => u.rol === 'tecnico' || u.rol === 'administrador'));
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (submitData.costo) submitData.costo = parseFloat(submitData.costo);
      if (submitData.tiempo_estimado) submitData.tiempo_estimado = parseInt(submitData.tiempo_estimado);

      if (editingBitacora) {
        await api.put(`/bitacoras/${editingBitacora._id}`, submitData);
        toast.success('Bitácora actualizada exitosamente');
      } else {
        await api.post('/bitacoras', submitData);
        toast.success('Bitácora creada exitosamente', {
          description: 'Se ha enviado una notificación por email'
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar bitácora');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta bitácora?')) {
      try {
        await api.delete(`/bitacoras/${id}`);
        toast.success('Bitácora eliminada exitosamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar bitácora');
      }
    }
  };

  const handleEdit = (bitacora) => {
    setEditingBitacora(bitacora);
    setFormData({
      empresa_id: bitacora.empresa_id,
      equipo_id: bitacora.equipo_id,
      tipo: bitacora.tipo,
      descripcion: bitacora.descripcion,
      tecnico_id: bitacora.tecnico_id,
      estado: bitacora.estado,
      observaciones: bitacora.observaciones || '',
      costo: bitacora.costo || '',
      tiempo_estimado: bitacora.tiempo_estimado || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      equipo_id: '',
      tipo: '',
      descripcion: '',
      tecnico_id: user?._id || '',
      estado: 'Pendiente',
      observaciones: '',
      costo: '',
      tiempo_estimado: '',
    });
    setEditingBitacora(null);
  };

  const getEmpresaNombre = (id) => empresas.find(e => e._id === id)?.nombre || 'N/A';
  const getEquipoNombre = (id) => equipos.find(e => e._id === id)?.nombre || 'N/A';
  const getTecnicoNombre = (id) => tecnicos.find(t => t._id === id)?.nombre || 'N/A';

  return (
    <div className="space-y-6" data-testid="bitacoras-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Bitácoras de Mantenimiento</h1>
          <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Registra y gestiona los mantenimientos</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
          data-testid="add-bitacora-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Bitácora
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-900">Fecha</TableHead>
              <TableHead className="font-semibold text-slate-900">Empresa</TableHead>
              <TableHead className="font-semibold text-slate-900">Equipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Tipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Descripción</TableHead>
              <TableHead className="font-semibold text-slate-900">Técnico</TableHead>
              <TableHead className="font-semibold text-slate-900">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : bitacoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay bitácoras registradas</p>
                </TableCell>
              </TableRow>
            ) : (
              bitacoras.map((bitacora) => (
                <TableRow key={bitacora._id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="bitacora-row">
                  <TableCell className="text-slate-600 text-sm">
                    {bitacora.fecha ? format(new Date(bitacora.fecha), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">{getEmpresaNombre(bitacora.empresa_id)}</TableCell>
                  <TableCell className="text-slate-600">{getEquipoNombre(bitacora.equipo_id)}</TableCell>
                  <TableCell className="text-slate-600">{bitacora.tipo}</TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">{bitacora.descripcion}</TableCell>
                  <TableCell className="text-slate-600">{getTecnicoNombre(bitacora.tecnico_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      bitacora.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      bitacora.estado === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {bitacora.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(bitacora)}
                      className="text-slate-600 hover:text-slate-900"
                      data-testid="edit-bitacora-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bitacora._id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid="delete-bitacora-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {editingBitacora ? 'Editar Bitácora' : 'Nueva Bitácora'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e._id} value={e._id}>{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipo *</Label>
                  <Select
                    value={formData.equipo_id}
                    onValueChange={(value) => setFormData({ ...formData, equipo_id: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.filter(eq => eq.empresa_id === formData.empresa_id).map((eq) => (
                        <SelectItem key={eq._id} value={eq._id}>{eq.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventivo">Preventivo</SelectItem>
                      <SelectItem value="Correctivo">Correctivo</SelectItem>
                      <SelectItem value="Instalación">Instalación</SelectItem>
                      <SelectItem value="Actualización">Actualización</SelectItem>
                      <SelectItem value="Revisión">Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Técnico *</Label>
                  <Select
                    value={formData.tecnico_id}
                    onValueChange={(value) => setFormData({ ...formData, tecnico_id: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tecnicos.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descripción *</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    className="rounded-sm"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tiempo Estimado (min)</Label>
                  <Input
                    type="number"
                    value={formData.tiempo_estimado}
                    onChange={(e) => setFormData({ ...formData, tiempo_estimado: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Costo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="rounded-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-sm">
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm" data-testid="save-bitacora-button">
                {editingBitacora ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}