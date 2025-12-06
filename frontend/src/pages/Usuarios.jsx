import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Users as UsersIcon, Loader2, Shield, UserCog, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'cliente',
    activo: true,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/usuarios/${editingUsuario._id}`, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await api.post('/usuarios', formData);
        toast.success('Usuario creado exitosamente');
      }
      setDialogOpen(false);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar usuario'));
    }
  };

  const handleDelete = async (id) => {
    if (currentUser._id === id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success('Usuario eliminado exitosamente');
        fetchUsuarios();
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      nombre: '',
      password: '',
      rol: 'cliente',
      activo: true,
    });
    setEditingUsuario(null);
  };

  const getRolIcon = (rol) => {
    if (rol === 'administrador') return <Shield className="h-4 w-4 text-purple-600" />;
    if (rol === 'tecnico') return <UserCog className="h-4 w-4 text-blue-600" />;
    return <User className="h-4 w-4 text-slate-600" />;
  };

  const getRolBadge = (rol) => {
    const colors = {
      'administrador': 'bg-purple-100 text-purple-800',
      'tecnico': 'bg-blue-100 text-blue-800',
      'cliente': 'bg-slate-100 text-slate-800'
    };
    return colors[rol] || colors.cliente;
  };

  const getRolPermisos = (rol) => {
    const permisos = {
      'administrador': [
        'Acceso completo al sistema',
        'Gestión de usuarios',
        'Configuración del sistema',
        'Gestión de todas las empresas',
        'Reportes y estadísticas'
      ],
      'tecnico': [
        'Gestión de equipos',
        'Crear y editar bitácoras',
        'Ver contraseñas de equipos',
        'Gestión de servicios',
        'Generar reportes'
      ],
      'cliente': [
        'Ver equipos de su empresa',
        'Ver bitácoras',
        'Ver servicios contratados',
        'Ver reportes de su empresa'
      ]
    };
    return permisos[rol] || [];
  };

  return (
    <div className="space-y-6" data-testid="usuarios-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Usuarios</h1>
          <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Gestiona usuarios y permisos del sistema</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
          data-testid="add-usuario-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-900">Nombre</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Rol</TableHead>
              <TableHead className="font-semibold text-slate-900">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay usuarios registrados</p>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario._id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="usuario-row">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {getRolIcon(usuario.rol)}
                      {usuario.nombre}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{usuario.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRolBadge(usuario.rol)}`}>
                      {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(usuario)}
                      className="text-slate-600 hover:text-slate-900"
                      data-testid="edit-usuario-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(usuario._id)}
                      disabled={currentUser._id === usuario._id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      data-testid="delete-usuario-button"
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
        <DialogContent className="sm:max-w-[600px] border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="rounded-sm border-slate-300"
                    data-testid="usuario-nombre-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-sm border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUsuario}
                    className="rounded-sm border-slate-300"
                    placeholder={editingUsuario ? 'Dejar vacío para mantener actual' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol *</Label>
                  <Select
                    value={formData.rol}
                    onValueChange={(value) => setFormData({ ...formData, rol: value })}
                  >
                    <SelectTrigger className="rounded-sm" data-testid="rol-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="tecnico">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          Técnico
                        </div>
                      </SelectItem>
                      <SelectItem value="cliente">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          Cliente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="activo" className="cursor-pointer">Usuario Activo</Label>
                  </div>
                </div>
              </div>

              {formData.rol && (
                <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">Permisos del rol: {formData.rol}</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {getRolPermisos(formData.rol).map((permiso, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {permiso}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm" data-testid="save-usuario-button">
                {editingUsuario ? 'Actualizar' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}