import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Loader2, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CustomFieldsRenderer from '../components/CustomFieldsRenderer';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialData, setHistorialData] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [selectedEquipoNombre, setSelectedEquipoNombre] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [loadingCamposDinamicos, setLoadingCamposDinamicos] = useState(false);
  const [formData, setFormData] = useState({
    empresa_id: '',
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    usuario_windows: '',
    correo_usuario: '',
    password_windows: '',
    password_correo: '',
    ubicacion: '',
    estado: 'Activo',
    fecha_compra: '',
    garantia_hasta: '',
    proveedor: '',
    valor_compra: '',
    direccion_mac: '',
    direccion_ip: '',
    hostname: '',
    sistema_operativo: '',
    notas: '',
    campos_personalizados: {},
    campos_dinamicos: {},
  });

  useEffect(() => {
    fetchEmpresas();
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await api.get('/configuracion/campos/equipos');
      setCustomFields(response.data.campos_equipos || []);
    } catch (error) {
      console.error('Error loading custom fields:', error);
    }
  };

  const fetchCamposDinamicos = async (tipoEquipo) => {
    if (!tipoEquipo) {
      setCamposDinamicos([]);
      return;
    }

    setLoadingCamposDinamicos(true);
    try {
      const tipoLower = tipoEquipo.toLowerCase().trim();
      const response = await api.get(`/configuracion/campos-tipo-equipo/${tipoLower}`);
      setCamposDinamicos(response.data.campos || []);
    } catch (error) {
      console.error('Error loading dynamic fields:', error);
      setCamposDinamicos([]);
    } finally {
      setLoadingCamposDinamicos(false);
    }
  };

  useEffect(() => {
    if (selectedEmpresa) {
      fetchEquipos();
    } else {
      setEquipos([]);
    }
  }, [selectedEmpresa]);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data);
      if (response.data.length > 0) {
        setSelectedEmpresa(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipos = async () => {
    if (!selectedEmpresa) return;
    
    try {
      const response = await api.get(`/equipos?empresa_id=${selectedEmpresa}`);
      setEquipos(response.data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const togglePasswordVisibility = async (equipoId) => {
    if (showPasswords[equipoId]) {
      setShowPasswords({ ...showPasswords, [equipoId]: null });
      return;
    }

    try {
      const response = await api.get(`/equipos/${equipoId}?show_passwords=true`);
      setShowPasswords({
        ...showPasswords,
        [equipoId]: {
          password_windows: response.data.password_windows,
          password_correo: response.data.password_correo,
        }
      });
    } catch (error) {
      toast.error('Error al obtener contraseñas');
    }
  };

  const fetchHistorial = async (equipoId, equipoNombre) => {
    setLoadingHistorial(true);
    setHistorialOpen(true);
    setSelectedEquipoNombre(equipoNombre);
    
    try {
      const response = await api.get(`/bitacoras?equipo_id=${equipoId}`);
      setHistorialData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading historial:', error);
      toast.error('Error al cargar el historial');
      setHistorialData([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      submitData.empresa_id = selectedEmpresa;

      if (editingEquipo) {
        await api.put(`/equipos/${editingEquipo._id}`, submitData);
        toast.success('Equipo actualizado exitosamente');
      } else {
        await api.post('/equipos', submitData);
        toast.success('Equipo creado exitosamente');
      }
      setDialogOpen(false);
      resetForm();
      fetchEquipos();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar equipo'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await api.delete(`/equipos/${id}`);
        toast.success('Equipo eliminado exitosamente');
        fetchEquipos();
      } catch (error) {
        toast.error('Error al eliminar equipo');
      }
    }
  };

  const handleEdit = (equipo) => {
    setEditingEquipo(equipo);
    
    // Formatear fechas si existen
    const formatFecha = (fecha) => {
      if (!fecha) return '';
      try {
        return new Date(fecha).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };
    
    setFormData({
      empresa_id: equipo.empresa_id,
      nombre: equipo.nombre,
      tipo: equipo.tipo,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numero_serie: equipo.numero_serie,
      usuario_windows: equipo.usuario_windows || '',
      correo_usuario: equipo.correo_usuario || '',
      password_windows: '',
      password_correo: '',
      ubicacion: equipo.ubicacion,
      estado: equipo.estado,
      fecha_compra: formatFecha(equipo.fecha_compra),
      garantia_hasta: formatFecha(equipo.garantia_hasta),
      proveedor: equipo.proveedor || '',
      valor_compra: equipo.valor_compra || '',
      direccion_mac: equipo.direccion_mac || '',
      direccion_ip: equipo.direccion_ip || '',
      hostname: equipo.hostname || '',
      sistema_operativo: equipo.sistema_operativo || '',
      notas: equipo.notas || '',
      campos_personalizados: equipo.campos_personalizados || {},
      campos_dinamicos: equipo.campos_dinamicos || {},
    });
    // Cargar campos dinámicos para el tipo de equipo
    if (equipo.tipo) {
      fetchCamposDinamicos(equipo.tipo);
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      empresa_id: selectedEmpresa,
      nombre: '',
      tipo: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      usuario_windows: '',
      correo_usuario: '',
      password_windows: '',
      password_correo: '',
      ubicacion: '',
      estado: 'Activo',
      fecha_compra: '',
      garantia_hasta: '',
      proveedor: '',
      valor_compra: '',
      direccion_mac: '',
      direccion_ip: '',
      hostname: '',
      sistema_operativo: '',
      notas: '',
      campos_personalizados: {},
      campos_dinamicos: {},
    });
    setCamposDinamicos([]);
    setEditingEquipo(null);
  };

  const getEmpresaNombre = (empresaId) => {
    const empresa = empresas.find(e => e._id === empresaId);
    return empresa ? empresa.nombre : 'N/A';
  };

  return (
    <div className="space-y-6" data-testid="equipos-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Equipos</h1>
          <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Gestiona los equipos y sus características</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          disabled={!selectedEmpresa}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
          data-testid="add-equipo-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none p-4">
        <div className="max-w-md">
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Seleccionar Empresa</Label>
          <Select
            value={selectedEmpresa}
            onValueChange={setSelectedEmpresa}
          >
            <SelectTrigger className="rounded-sm border-slate-300" data-testid="empresa-filter-select">
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
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-900">Nombre</TableHead>
              <TableHead className="font-semibold text-slate-900">Tipo</TableHead>
              <TableHead className="font-semibold text-slate-900">Marca/Modelo</TableHead>
              <TableHead className="font-semibold text-slate-900">Serie</TableHead>
              <TableHead className="font-semibold text-slate-900">Procesador</TableHead>
              <TableHead className="font-semibold text-slate-900">RAM</TableHead>
              <TableHead className="font-semibold text-slate-900">Ubicación</TableHead>
              <TableHead className="font-semibold text-slate-900">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900">Contraseñas</TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : !selectedEmpresa ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                  <Monitor className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>Selecciona una empresa para ver sus equipos</p>
                </TableCell>
              </TableRow>
            ) : equipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                  <Monitor className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay equipos registrados para esta empresa</p>
                </TableCell>
              </TableRow>
            ) : (
              equipos.map((equipo) => (
                <TableRow key={equipo._id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="equipo-row">
                  <TableCell className="font-medium text-slate-900">{equipo.nombre}</TableCell>
                  <TableCell className="text-slate-600">{equipo.tipo}</TableCell>
                  <TableCell className="text-slate-600">{equipo.marca} {equipo.modelo}</TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs">{equipo.numero_serie}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{equipo.procesador || '-'}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{equipo.memoria_ram || '-'}</TableCell>
                  <TableCell className="text-slate-600">{equipo.ubicacion}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      equipo.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                      equipo.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {equipo.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(equipo.usuario_windows || equipo.correo_usuario) && (
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(equipo._id)}
                          className="text-slate-600 hover:text-slate-900 h-6 px-2"
                          data-testid="toggle-password-button"
                        >
                          {showPasswords[equipo._id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        {showPasswords[equipo._id] && (
                          <div className="text-xs space-y-1 bg-slate-50 p-2 rounded">
                            {showPasswords[equipo._id].password_windows && (
                              <div className="font-mono">
                                <span className="text-slate-500">Win: </span>
                                {showPasswords[equipo._id].password_windows}
                              </div>
                            )}
                            {showPasswords[equipo._id].password_correo && (
                              <div className="font-mono">
                                <span className="text-slate-500">Email: </span>
                                {showPasswords[equipo._id].password_correo}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchHistorial(equipo._id, equipo.nombre)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Ver Historial"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(equipo)}
                      className="text-slate-600 hover:text-slate-900"
                      data-testid="edit-equipo-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(equipo._id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid="delete-equipo-button"
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
              {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="rounded-sm"
                    data-testid="equipo-nombre-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => {
                      setFormData({ ...formData, tipo: value, campos_dinamicos: {} });
                      fetchCamposDinamicos(value);
                    }}
                    required
                  >
                    <SelectTrigger className="rounded-sm" id="tipo">
                      <SelectValue placeholder="Seleccionar tipo de equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Servidor">Servidor</SelectItem>
                      <SelectItem value="Firewall">Firewall</SelectItem>
                      <SelectItem value="Switch">Switch</SelectItem>
                      <SelectItem value="Repetidor">Repetidor / Access Point</SelectItem>
                      <SelectItem value="DVR">DVR / NVR</SelectItem>
                      <SelectItem value="Red">Equipo de Red</SelectItem>
                      <SelectItem value="Impresora">Impresora</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="UPS">UPS / No-Break</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="numero_serie">Número de Serie *</Label>
                  <Input
                    id="numero_serie"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    required
                    className="rounded-sm font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_compra">Fecha de Compra</Label>
                  <Input
                    id="fecha_compra"
                    type="date"
                    value={formData.fecha_compra}
                    onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garantia_hasta">Garantía Hasta</Label>
                  <Input
                    id="garantia_hasta"
                    type="date"
                    value={formData.garantia_hasta}
                    onChange={(e) => setFormData({ ...formData, garantia_hasta: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="rounded-sm"
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_compra">Valor de Compra</Label>
                  <Input
                    id="valor_compra"
                    value={formData.valor_compra}
                    onChange={(e) => setFormData({ ...formData, valor_compra: e.target.value })}
                    className="rounded-sm"
                    placeholder="$1,500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion_mac">Dirección MAC</Label>
                  <Input
                    id="direccion_mac"
                    value={formData.direccion_mac}
                    onChange={(e) => setFormData({ ...formData, direccion_mac: e.target.value })}
                    className="rounded-sm font-mono text-sm"
                    placeholder="00:1A:2B:3C:4D:5E"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion_ip">Dirección IP</Label>
                  <Input
                    id="direccion_ip"
                    value={formData.direccion_ip}
                    onChange={(e) => setFormData({ ...formData, direccion_ip: e.target.value })}
                    className="rounded-sm font-mono"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input
                    id="hostname"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="rounded-sm font-mono"
                    placeholder="PC-CONTABILIDAD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sistema_operativo">Sistema Operativo</Label>
                  <Input
                    id="sistema_operativo"
                    value={formData.sistema_operativo}
                    onChange={(e) => setFormData({ ...formData, sistema_operativo: e.target.value })}
                    className="rounded-sm"
                    placeholder="Windows 11 Pro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usuario_windows">Usuario Windows</Label>
                  <Input
                    id="usuario_windows"
                    value={formData.usuario_windows}
                    onChange={(e) => setFormData({ ...formData, usuario_windows: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_windows">Contraseña Windows</Label>
                  <Input
                    id="password_windows"
                    type="password"
                    value={formData.password_windows}
                    onChange={(e) => setFormData({ ...formData, password_windows: e.target.value })}
                    className="rounded-sm"
                    placeholder={editingEquipo ? "Dejar vacío para no cambiar" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo_usuario">Correo Usuario</Label>
                  <Input
                    id="correo_usuario"
                    type="email"
                    value={formData.correo_usuario}
                    onChange={(e) => setFormData({ ...formData, correo_usuario: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_correo">Contraseña Correo</Label>
                  <Input
                    id="password_correo"
                    type="password"
                    value={formData.password_correo}
                    onChange={(e) => setFormData({ ...formData, password_correo: e.target.value })}
                    className="rounded-sm"
                    placeholder={editingEquipo ? "Dejar vacío para no cambiar" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    required
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="rounded-sm"
                  />
                </div>

                {/* Campos Dinámicos según Tipo de Equipo */}
                {camposDinamicos.length > 0 && (
                  <div className="col-span-2 space-y-4">
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Campos Específicos para {formData.tipo}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {loadingCamposDinamicos ? (
                          <div className="col-span-2 text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                          </div>
                        ) : (
                          camposDinamicos.map((campo, index) => (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={`dinamico_${campo.nombre}`}>
                                {campo.nombre} {campo.requerido && '*'}
                              </Label>
                              {campo.tipo === 'texto' && (
                                <Input
                                  id={`dinamico_${campo.nombre}`}
                                  value={formData.campos_dinamicos[campo.nombre] || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    campos_dinamicos: {
                                      ...formData.campos_dinamicos,
                                      [campo.nombre]: e.target.value
                                    }
                                  })}
                                  required={campo.requerido}
                                  className="rounded-sm"
                                />
                              )}
                              {campo.tipo === 'numero' && (
                                <Input
                                  id={`dinamico_${campo.nombre}`}
                                  type="number"
                                  value={formData.campos_dinamicos[campo.nombre] || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    campos_dinamicos: {
                                      ...formData.campos_dinamicos,
                                      [campo.nombre]: e.target.value
                                    }
                                  })}
                                  required={campo.requerido}
                                  className="rounded-sm"
                                />
                              )}
                              {campo.tipo === 'select' && (
                                <Select
                                  value={formData.campos_dinamicos[campo.nombre] || ''}
                                  onValueChange={(value) => setFormData({
                                    ...formData,
                                    campos_dinamicos: {
                                      ...formData.campos_dinamicos,
                                      [campo.nombre]: value
                                    }
                                  })}
                                >
                                  <SelectTrigger className="rounded-sm">
                                    <SelectValue placeholder="Seleccionar..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {campo.opciones && campo.opciones.map((opcion, idx) => (
                                      <SelectItem key={idx} value={opcion}>
                                        {opcion}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {campo.tipo === 'checkbox' && (
                                <div className="flex items-center space-x-2 pt-2">
                                  <input
                                    id={`dinamico_${campo.nombre}`}
                                    type="checkbox"
                                    checked={formData.campos_dinamicos[campo.nombre] === true || formData.campos_dinamicos[campo.nombre] === 'true'}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      campos_dinamicos: {
                                        ...formData.campos_dinamicos,
                                        [campo.nombre]: e.target.checked
                                      }
                                    })}
                                    className="h-4 w-4 rounded border-slate-300"
                                  />
                                  <label htmlFor={`dinamico_${campo.nombre}`} className="text-sm">
                                    {campo.nombre}
                                  </label>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos Personalizados */}
                <CustomFieldsRenderer
                  customFields={customFields}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                className="rounded-sm"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm" data-testid="save-equipo-button">
                {editingEquipo ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Historial */}
      <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Historial de Mantenimientos - {selectedEquipoNombre}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingHistorial ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : historialData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No hay registros de mantenimiento para este equipo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historialData.map((bitacora) => (
                  <div key={bitacora._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Fecha:</span>
                        <p className="text-slate-900">
                          {bitacora.fecha ? format(new Date(bitacora.fecha), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Técnico:</span>
                        <p className="text-slate-900">{bitacora.tecnico || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Tipo:</span>
                        <p className="text-slate-900">{bitacora.tipo_servicio || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Estado:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bitacora.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                          bitacora.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {bitacora.estado || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <span className="text-sm font-semibold text-slate-700">Descripción:</span>
                      <p className="text-slate-900 mt-1 whitespace-pre-wrap">{bitacora.descripcion || 'Sin descripción'}</p>
                    </div>
                    {bitacora.observaciones && (
                      <div className="border-t border-slate-200 pt-3 mt-3">
                        <span className="text-sm font-semibold text-slate-700">Observaciones:</span>
                        <p className="text-slate-600 mt-1 whitespace-pre-wrap">{bitacora.observaciones}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setHistorialOpen(false)}
              className="rounded-sm"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}