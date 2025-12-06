import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [customFields, setCustomFields] = useState([]);
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
    memoria_ram: '',
    disco_duro: '',
    espacio_disponible: '',
    procesador: '',
    componentes: '',
    notas: '',
    campos_personalizados: {},
  });

  useEffect(() => {
    fetchEmpresas();
  }, []);

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
      memoria_ram: equipo.memoria_ram || '',
      disco_duro: equipo.disco_duro || '',
      espacio_disponible: equipo.espacio_disponible || '',
      procesador: equipo.procesador || '',
      componentes: equipo.componentes || '',
      notas: equipo.notas || '',
    });
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
      memoria_ram: '',
      disco_duro: '',
      espacio_disponible: '',
      procesador: '',
      componentes: '',
      notas: '',
    });
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
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    className="rounded-sm"
                    placeholder="Laptop, Desktop, Servidor..."
                  />
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
                  <Label htmlFor="procesador">Procesador</Label>
                  <Input
                    id="procesador"
                    value={formData.procesador}
                    onChange={(e) => setFormData({ ...formData, procesador: e.target.value })}
                    className="rounded-sm"
                    placeholder="Intel Core i7..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoria_ram">Memoria RAM</Label>
                  <Input
                    id="memoria_ram"
                    value={formData.memoria_ram}
                    onChange={(e) => setFormData({ ...formData, memoria_ram: e.target.value })}
                    className="rounded-sm"
                    placeholder="16 GB DDR4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disco_duro">Disco Duro</Label>
                  <Input
                    id="disco_duro"
                    value={formData.disco_duro}
                    onChange={(e) => setFormData({ ...formData, disco_duro: e.target.value })}
                    className="rounded-sm"
                    placeholder="512 GB SSD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espacio_disponible">Espacio Disponible</Label>
                  <Input
                    id="espacio_disponible"
                    value={formData.espacio_disponible}
                    onChange={(e) => setFormData({ ...formData, espacio_disponible: e.target.value })}
                    className="rounded-sm"
                    placeholder="300 GB"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="componentes">Componentes Adicionales</Label>
                  <Input
                    id="componentes"
                    value={formData.componentes}
                    onChange={(e) => setFormData({ ...formData, componentes: e.target.value })}
                    className="rounded-sm"
                    placeholder="GPU, Tarjetas adicionales..."
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
    </div>
  );
}