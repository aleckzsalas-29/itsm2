import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Reportes() {
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('moderna');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empresasRes, equiposRes] = await Promise.all([
        api.get('/empresas'),
        api.get('/equipos')
      ]);
      setEmpresas(empresasRes.data);
      setEquipos(equiposRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleGenerateEmpresaReport = async () => {
    if (!selectedEmpresa) {
      toast.error('Por favor seleccione una empresa');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reportes/empresa/${selectedEmpresa}`);
      toast.success('Reporte generado exitosamente', {
        description: 'Se ha enviado una notificación por email'
      });
      
      const downloadUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.filename.replace('empresa_', '/api/reportes/download/empresa_')}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al generar reporte'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEquipoReport = async () => {
    if (!selectedEquipo) {
      toast.error('Por favor seleccione un equipo');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reportes/equipo/${selectedEquipo}`);
      toast.success('Reporte generado exitosamente');
      
      const downloadUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.filename.replace('equipo_', '/api/reportes/download/equipo_')}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al generar reporte'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="reportes-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Reportes</h1>
        <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Genera reportes en formato PDF</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 shadow-none rounded-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Reporte por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Genera un reporte completo de una empresa incluyendo equipos, bitácoras y servicios contratados.
            </p>
            <div className="space-y-2">
              <Label>Seleccionar Empresa</Label>
              <Select
                value={selectedEmpresa}
                onValueChange={setSelectedEmpresa}
              >
                <SelectTrigger className="rounded-sm" data-testid="empresa-select">
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
            <Button
              onClick={handleGenerateEmpresaReport}
              disabled={loading || !selectedEmpresa}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
              data-testid="generate-empresa-report-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-none rounded-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <FileText className="mr-2 h-5 w-5 text-green-600" />
              Reporte por Equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Genera un reporte detallado de un equipo específico con su historial de mantenimiento.
            </p>
            <div className="space-y-2">
              <Label>Seleccionar Equipo</Label>
              <Select
                value={selectedEquipo}
                onValueChange={setSelectedEquipo}
              >
                <SelectTrigger className="rounded-sm" data-testid="equipo-select">
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo._id} value={equipo._id}>
                      {equipo.nombre} - {equipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerateEquipoReport}
              disabled={loading || !selectedEquipo}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-none"
              data-testid="generate-equipo-report-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-none rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li>Los reportes se generan en formato PDF listo para imprimir</li>
            <li>Los reportes de empresa incluyen todos los equipos, bitácoras y servicios</li>
            <li>Los reportes de equipo incluyen el historial completo de mantenimiento</li>
            <li>Se envía una notificación por email cuando se genera un reporte de empresa</li>
            <li>Los reportes se descargan automáticamente una vez generados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}