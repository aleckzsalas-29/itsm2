import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Server, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [showCredentials, setShowCredentials] = useState({});
  const [formData, setFormData] = useState({
    empresa_id: '',
    tipo: '',
    nombre: '',
    proveedor: '',
    costo_mensual: '',
    fecha_inicio: '',
    fecha_renovacion: '',
    activo: true,
    credenciales: '',
    url_acceso: '',
    notas: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [serviciosRes, empresasRes] = await Promise.all([
        api.get('/servicios'),
        api.get('/empresas')
      ]);
      setServicios(serviciosRes.data);
      setEmpresas(empresasRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const toggleCredentialVisibility = async (servicioId) => {
    if (showCredentials[servicioId]) {
      setShowCredentials({ ...showCredentials, [servicioId]: null });
      return;
    }

    try {
      const response = await api.get(`/servicios/${servicioId}?show_credentials=true`);
      setShowCredentials({
        ...showCredentials,
        [servicioId]: response.data.credenciales
      });
    } catch (error) {
      toast.error('Error al obtener credenciales');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      submitData.costo_mensual = parseFloat(submitData.costo_mensual);
      submitData.fecha_inicio = new Date(submitData.fecha_inicio).toISOString();
      submitData.fecha_renovacion = new Date(submitData.fecha_renovacion).toISOString();

      if (editingServicio) {
        await api.put(`/servicios/${editingServicio._id}`, submitData);
        toast.success('Servicio actualizado exitosamente');
      } else {
        await api.post('/servicios', submitData);
        toast.success('Servicio creado exitosamente');
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar servicio'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este servicio?')) {
      try {
        await api.delete(`/servicios/${id}`);
        toast.success('Servicio eliminado exitosamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar servicio');
      }
    }
  };

  const handleEdit = (servicio) => {
    setEditingServicio(servicio);
    setFormData({
      empresa_id: servicio.empresa_id,
      tipo: servicio.tipo,
      nombre: servicio.nombre,
      proveedor: servicio.proveedor,
      costo_mensual: servicio.costo_mensual,
      fecha_inicio: servicio.fecha_inicio ? servicio.fecha_inicio.split('T')[0] : '',
      fecha_renovacion: servicio.fecha_renovacion ? servicio.fecha_renovacion.split('T')[0] : '',
      activo: servicio.activo,
      credenciales: '',
      url_acceso: servicio.url_acceso || '',
      notas: servicio.notas || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      tipo: '',
      nombre: '',
      proveedor: '',
      costo_mensual: '',
      fecha_inicio: '',
      fecha_renovacion: '',
      activo: true,
      credenciales: '',
      url_acceso: '',
      notas: '',
    });
    setEditingServicio(null);
  };

  const getEmpresaNombre = (id) => empresas.find(e => e._id === id)?.nombre || 'N/A';

  return (
    <div className="space-y-6" data-testid="servicios-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Servicios Contratados</h1>
          <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Gestiona hosting, licencias y servidores VPS</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
          data-testid="add-servicio-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-900">Nombre</TableHead>
              <TableHead className="font-semibold text-slate-900">Empresa</TableHead>
              <TableHead className="font-semibold text-slate-900">Tipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Proveedor</TableHead>
              <TableHead className="font-semibold text-slate-900">Costo Mensual</TableHead>
              <TableHead className="font-semibold text-slate-900">Renovación</TableHead>
              <TableHead className="font-semibold text-slate-900">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900">Credenciales</TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : servicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  <Server className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay servicios registrados</p>
                </TableCell>
              </TableRow>
            ) : (
              servicios.map((servicio) => (
                <TableRow key={servicio._id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="servicio-row">
                  <TableCell className="font-medium text-slate-900">{servicio.nombre}</TableCell>
                  <TableCell className="text-slate-600">{getEmpresaNombre(servicio.empresa_id)}</TableCell>
                  <TableCell className="text-slate-600">{servicio.tipo}</TableCell>
                  <TableCell className="text-slate-600">{servicio.proveedor}</TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm">${servicio.costo_mensual.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {servicio.fecha_renovacion ? format(new Date(servicio.fecha_renovacion), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      servicio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCredentialVisibility(servicio._id)}
                      className="text-slate-600 hover:text-slate-900 h-6 px-2"
                      data-testid="toggle-credentials-button"
                    >
                      {showCredentials[servicio._id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    {showCredentials[servicio._id] && (
                      <div className="text-xs font-mono bg-slate-50 p-2 rounded mt-1">
                        {showCredentials[servicio._id]}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(servicio)}
                      className="text-slate-600 hover:text-slate-900"
                      data-testid="edit-servicio-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(servicio._id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid="delete-servicio-button"
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
              {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Empresa *</Label>
                  <Select value={formData.empresa_id} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })} required>
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
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })} required>
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hosting">Hosting</SelectItem>
                      <SelectItem value="Licencia">Licencia</SelectItem>
                      <SelectItem value="Servidor VPS">Servidor VPS</SelectItem>
                      <SelectItem value="Dominio">Dominio</SelectItem>
                      <SelectItem value="SSL">Certificado SSL</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Proveedor *</Label>
                  <Input value={formData.proveedor} onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })} required className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Costo Mensual *</Label>
                  <Input type="number" step="0.01" value={formData.costo_mensual} onChange={(e) => setFormData({ ...formData, costo_mensual: e.target.value })} required className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Inicio *</Label>
                  <Input type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} required className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Renovación *</Label>
                  <Input type="date" value={formData.fecha_renovacion} onChange={(e) => setFormData({ ...formData, fecha_renovacion: e.target.value })} required className="rounded-sm" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>URL de Acceso</Label>
                  <Input type="url" value={formData.url_acceso} onChange={(e) => setFormData({ ...formData, url_acceso: e.target.value })} className="rounded-sm" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Credenciales</Label>
                  <Input type="password" value={formData.credenciales} onChange={(e) => setFormData({ ...formData, credenciales: e.target.value })} className="rounded-sm" placeholder={editingServicio ? "Dejar vacío para no cambiar" : ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notas</Label>
                  <Input value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} className="rounded-sm" />
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="activo" className="cursor-pointer">Servicio Activo</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-sm">
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm" data-testid="save-servicio-button">
                {editingServicio ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}