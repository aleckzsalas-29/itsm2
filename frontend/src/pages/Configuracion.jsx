import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Settings, Upload, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Configuracion() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombreSistema, setNombreSistema] = useState('Sistema ITSM');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/configuracion');
      setConfig(response.data);
      setNombreSistema(response.data.nombre_sistema || 'Sistema ITSM');
      if (response.data.logo_url) {
        setLogoPreview(response.data.logo_url);
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El logo debe ser menor a 2MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) {
      toast.error('Selecciona un logo primero');
      return;
    }

    setSaving(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        
        await api.post('/configuracion/logo', bytes, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        
        toast.success('Logo actualizado exitosamente');
        setLogoFile(null);
        fetchConfig();
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar logo'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNombre = async () => {
    setSaving(true);
    try {
      await api.put('/configuracion', {
        nombre_sistema: nombreSistema
      });
      toast.success('Nombre del sistema actualizado exitosamente');
      // Recargar para actualizar en toda la app
      window.location.reload();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar nombre'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="configuracion-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Configuración</h1>
        <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Personaliza el sistema</p>
      </div>

      <Card className="border border-blue-200 shadow-none rounded-sm bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                🎯 Gestionar Campos Personalizados
              </h3>
              <p className="text-sm text-slate-600">
                Añade, edita o elimina campos personalizados para Empresas, Equipos, Bitácoras y Servicios
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/campos-personalizados'}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
            >
              Configurar Campos
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 shadow-none rounded-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Settings className="mr-2 h-5 w-5 text-blue-600" />
              Nombre del Sistema
            </CardTitle>
            <CardDescription>Cambia el nombre que aparece en toda la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-sistema">Nombre del Sistema</Label>
              <Input
                id="nombre-sistema"
                value={nombreSistema}
                onChange={(e) => setNombreSistema(e.target.value)}
                className="rounded-sm border-slate-300"
                placeholder="Sistema ITSM"
                data-testid="nombre-sistema-input"
              />
            </div>
            <Button
              onClick={handleSaveNombre}
              disabled={saving || !nombreSistema}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
              data-testid="save-nombre-button"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Nombre
                </>
              )}
            </Button>
            <div className="p-3 bg-blue-50 rounded-sm border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> El nombre aparecerá en el header, login y reportes PDF.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-none rounded-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <ImageIcon className="mr-2 h-5 w-5 text-green-600" />
              Logo de la Empresa
            </CardTitle>
            <CardDescription>Logo que aparecerá en los reportes PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Subir Logo (PNG, JPG - Max 2MB)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="rounded-sm border-slate-300"
                  data-testid="logo-upload-input"
                />
                <Button
                  onClick={handleSaveLogo}
                  disabled={saving || !logoFile}
                  variant="outline"
                  className="rounded-sm"
                  data-testid="save-logo-button"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 max-w-full object-contain"
                    data-testid="logo-preview"
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded-sm border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Nota:</strong> El logo aparecerá en la esquina superior izquierda de todos los reportes PDF.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-none rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Vista Previa de Reportes
          </CardTitle>
          <CardDescription>Así se verán tus reportes PDF con la configuración actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-sm p-6 bg-white">
            <div className="flex items-start gap-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-12 object-contain"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Reporte de Ejemplo
                </h2>
                <p className="text-sm text-slate-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {nombreSistema} - Generado: {new Date().toLocaleDateString('es-MX')}
                </p>
                <div className="mt-4 p-4 bg-slate-50 rounded">
                  <p className="text-sm text-slate-700">Contenido del reporte...</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}