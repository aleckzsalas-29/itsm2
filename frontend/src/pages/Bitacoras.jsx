import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, ClipboardList, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Bitacoras() {
  const { user } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBitacora, setEditingBitacora] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('moderna');
  const [formData, setFormData] = useState({
    empresa_id: '',
    equipo_id: '',
    tipo: '',
    descripcion: '',
    tecnico_id: user?._id || '',
    estado: 'Pendiente',
    fecha_revision: '',
    observaciones: '',
    tiempo_estimado: '',
    limpieza_fisica: false,
    actualizacion_software: false,
    revision_hardware: false,
    respaldo_datos: false,
    optimizacion_sistema: false,
    diagnostico_problema: '',
    solucion_aplicada: '',
    componentes_reemplazados: '',
    anotaciones_extras: '',
  });

  useEffect(() => {
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (selectedEmpresa) {
      fetchBitacoras();
    } else {
      setBitacoras([]);
    }
  }, [selectedEmpresa]);

  const fetchEmpresas = async () => {
    try {
      const [empresasRes, equiposRes, usuariosRes] = await Promise.all([
        api.get('/empresas'),
        api.get('/equipos'),
        api.get('/usuarios')
      ]);
      setEmpresas(empresasRes.data);
      setEquipos(equiposRes.data);
      setTecnicos(usuariosRes.data.filter(u => u.rol === 'tecnico' || u.rol === 'administrador'));
      if (empresasRes.data.length > 0) {
        setSelectedEmpresa(empresasRes.data[0]._id);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchBitacoras = async () => {
    if (!selectedEmpresa) return;
    
    try {
      const response = await api.get(`/bitacoras?empresa_id=${selectedEmpresa}`);
      setBitacoras(response.data);
    } catch (error) {
      toast.error('Error al cargar bitácoras');
    }
  };

  const handleExport = async (periodo) => {
    if (!selectedEmpresa) {
      toast.error('Selecciona una empresa primero');
      return;
    }

    try {
      const response = await api.get(`/bitacoras/exportar?empresa_id=${selectedEmpresa}&periodo=${periodo}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bitacoras_${periodo}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Bitácoras exportadas a CSV exitosamente');
    } catch (error) {
      toast.error('Error al exportar bitácoras');
    }
  };

  const handleExportPDF = async (periodo) => {
    if (!selectedEmpresa) {
      toast.error('Selecciona una empresa primero');
      return;
    }

    try {
      const response = await api.get(`/bitacoras/exportar-pdf?empresa_id=${selectedEmpresa}&periodo=${periodo}&template=${selectedTemplate}`);
      
      if (response.data.filename) {
        const downloadUrl = `${api.defaults.baseURL}/reportes/download/${response.data.filename}`;
        window.open(downloadUrl, '_blank');
        toast.success('Reporte PDF generado exitosamente');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al generar PDF'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      submitData.empresa_id = selectedEmpresa;
      
      // Convertir tiempo_estimado a entero o null
      if (submitData.tiempo_estimado && submitData.tiempo_estimado !== '') {
        submitData.tiempo_estimado = parseInt(submitData.tiempo_estimado);
      } else {
        submitData.tiempo_estimado = null;
      }
      
      // Convertir fecha_revision a formato ISO si existe
      if (submitData.fecha_revision && submitData.fecha_revision !== '') {
        try {
          const fecha = new Date(submitData.fecha_revision + 'T00:00:00');
          submitData.fecha_revision = fecha.toISOString();
        } catch (error) {
          console.error('Error formateando fecha_revision:', error);
          submitData.fecha_revision = null;
        }
      } else {
        submitData.fecha_revision = null;
      }

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
      fetchBitacoras();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar bitácora'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta bitácora?')) {
      try {
        await api.delete(`/bitacoras/${id}`);
        toast.success('Bitácora eliminada exitosamente');
        fetchBitacoras();
      } catch (error) {
        toast.error('Error al eliminar bitácora');
      }
    }
  };

  const handleEdit = (bitacora) => {
    setEditingBitacora(bitacora);
    
    // Formatear fecha_revision si existe
    let fechaRevisionFormatted = '';
    if (bitacora.fecha_revision) {
      try {
        const fecha = new Date(bitacora.fecha_revision);
        fechaRevisionFormatted = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      } catch (error) {
        console.error('Error formateando fecha_revision:', error);
      }
    }
    
    setFormData({
      empresa_id: bitacora.empresa_id,
      equipo_id: bitacora.equipo_id,
      tipo: bitacora.tipo,
      descripcion: bitacora.descripcion,
      tecnico_id: bitacora.tecnico_id,
      estado: bitacora.estado,
      fecha_revision: fechaRevisionFormatted,
      observaciones: bitacora.observaciones || '',
      tiempo_estimado: bitacora.tiempo_estimado || '',
      limpieza_fisica: bitacora.limpieza_fisica || false,
      actualizacion_software: bitacora.actualizacion_software || false,
      revision_hardware: bitacora.revision_hardware || false,
      respaldo_datos: bitacora.respaldo_datos || false,
      optimizacion_sistema: bitacora.optimizacion_sistema || false,
      diagnostico_problema: bitacora.diagnostico_problema || '',
      solucion_aplicada: bitacora.solucion_aplicada || '',
      componentes_reemplazados: bitacora.componentes_reemplazados || '',
      anotaciones_extras: bitacora.anotaciones_extras || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      empresa_id: selectedEmpresa,
      equipo_id: '',
      tipo: '',
      descripcion: '',
      tecnico_id: user?._id || '',
      estado: 'Pendiente',
      fecha_revision: '',
      observaciones: '',
      tiempo_estimado: '',
      limpieza_fisica: false,
      actualizacion_software: false,
      revision_hardware: false,
      respaldo_datos: false,
      optimizacion_sistema: false,
      diagnostico_problema: '',
      solucion_aplicada: '',
      componentes_reemplazados: '',
      anotaciones_extras: '',
    });
    setEditingBitacora(null);
  };

  const getEquipoNombre = (id) => equipos.find(e => e._id === id)?.nombre || 'N/A';
  const getTecnicoNombre = (id) => tecnicos.find(t => t._id === id)?.nombre || 'N/A';

  const showPreventivo = formData.tipo === 'Preventivo';
  const showCorrectivo = formData.tipo === 'Correctivo';

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
          disabled={!selectedEmpresa}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
          data-testid="add-bitacora-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Bitácora
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Seleccionar Empresa</Label>
            <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
              <SelectTrigger className="rounded-sm border-slate-300">
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa._id} value={empresa._id}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Exportar Bitácoras</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-xs text-slate-600 font-medium">CSV:</span>
                <Button onClick={() => handleExport('dia')} variant="outline" size="sm" className="rounded-sm">
                  <Download className="mr-1 h-3 w-3" /> Día
                </Button>
                <Button onClick={() => handleExport('semana')} variant="outline" size="sm" className="rounded-sm">
                  <Download className="mr-1 h-3 w-3" /> Semana
                </Button>
                <Button onClick={() => handleExport('mes')} variant="outline" size="sm" className="rounded-sm">
                  <Download className="mr-1 h-3 w-3" /> Mes
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">Plantilla PDF:</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="rounded-sm h-8 text-xs">
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderna">
                      <span className="font-semibold">Moderna</span> - Bloques con colores e íconos
                    </SelectItem>
                    <SelectItem value="clasica">
                      <span className="font-semibold">Clásica</span> - Formato tradicional con tablas
                    </SelectItem>
                    <SelectItem value="minimalista">
                      <span className="font-semibold">Minimalista</span> - Diseño limpio
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-slate-600 font-medium">PDF:</span>
                <Button onClick={() => handleExportPDF('dia')} variant="outline" size="sm" className="rounded-sm bg-red-50 hover:bg-red-100">
                  <Download className="mr-1 h-3 w-3" /> Día
                </Button>
                <Button onClick={() => handleExportPDF('semana')} variant="outline" size="sm" className="rounded-sm bg-red-50 hover:bg-red-100">
                  <Download className="mr-1 h-3 w-3" /> Semana
                </Button>
                <Button onClick={() => handleExportPDF('mes')} variant="outline" size="sm" className="rounded-sm bg-red-50 hover:bg-red-100">
                  <Download className="mr-1 h-3 w-3" /> Mes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-900">Fecha</TableHead>
              <TableHead className="font-semibold text-slate-900">Equipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Tipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Descripción</TableHead>
              <TableHead className="font-semibold text-slate-900">Técnico</TableHead>
              <TableHead className="font-semibold text-slate-900">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900">F. Revisión</TableHead>
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
            ) : !selectedEmpresa ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>Selecciona una empresa para ver sus bitácoras</p>
                </TableCell>
              </TableRow>
            ) : bitacoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay bitácoras registradas para esta empresa</p>
                </TableCell>
              </TableRow>
            ) : (
              bitacoras.map((bitacora) => (
                <TableRow key={bitacora._id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="bitacora-row">
                  <TableCell className="text-slate-600 text-sm">
                    {bitacora.fecha ? format(new Date(bitacora.fecha), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
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
                  <TableCell className="text-slate-600 text-sm">
                    {bitacora.fecha_revision ? format(new Date(bitacora.fecha_revision), 'dd/MM/yyyy') : '-'}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {editingBitacora ? 'Editar Bitácora' : 'Nueva Bitácora'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                      {equipos.filter(eq => eq.empresa_id === selectedEmpresa).map((eq) => (
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

                {showPreventivo && (
                  <div className="col-span-2 space-y-3 p-4 bg-blue-50 rounded-sm">
                    <h3 className="font-semibold text-slate-900">Tareas Mantenimiento Preventivo</h3>
                    {['limpieza_fisica', 'actualizacion_software', 'revision_hardware', 'respaldo_datos', 'optimizacion_sistema'].map((campo) => (
                      <div key={campo} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={campo}
                          checked={formData[campo]}
                          onChange={(e) => setFormData({ ...formData, [campo]: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={campo} className="cursor-pointer">
                          {campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {showCorrectivo && (
                  <div className="col-span-2 space-y-3 p-4 bg-red-50 rounded-sm">
                    <h3 className="font-semibold text-slate-900">Detalles Mantenimiento Correctivo</h3>
                    <div className="space-y-2">
                      <Label>Diagnóstico del Problema</Label>
                      <Textarea
                        value={formData.diagnostico_problema}
                        onChange={(e) => setFormData({ ...formData, diagnostico_problema: e.target.value })}
                        className="rounded-sm"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Solución Aplicada</Label>
                      <Textarea
                        value={formData.solucion_aplicada}
                        onChange={(e) => setFormData({ ...formData, solucion_aplicada: e.target.value })}
                        className="rounded-sm"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Componentes Reemplazados</Label>
                      <Input
                        value={formData.componentes_reemplazados}
                        onChange={(e) => setFormData({ ...formData, componentes_reemplazados: e.target.value })}
                        className="rounded-sm"
                      />
                    </div>
                  </div>
                )}

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
                <div className="space-y-2">
                  <Label htmlFor="tiempo_estimado">Tiempo Estimado (minutos)</Label>
                  <Input
                    id="tiempo_estimado"
                    type="number"
                    value={formData.tiempo_estimado}
                    onChange={(e) => setFormData({ ...formData, tiempo_estimado: e.target.value })}
                    className="rounded-sm"
                    placeholder="ej: 60"
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
                <div className="space-y-2 col-span-2">
                  <Label>Anotaciones Extras</Label>
                  <Textarea
                    value={formData.anotaciones_extras}
                    onChange={(e) => setFormData({ ...formData, anotaciones_extras: e.target.value })}
                    className="rounded-sm"
                    rows={3}
                    placeholder="Información adicional relevante..."
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