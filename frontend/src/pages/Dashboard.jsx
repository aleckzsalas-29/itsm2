import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Monitor, ClipboardList, Server, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/estadisticas');
      setStats(response.data);
    } catch (err) {
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="border border-slate-200 shadow-none rounded-sm" data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {loading ? '-' : value}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Dashboard</h1>
        <p className="text-slate-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Bienvenido, {user?.nombre}</p>
      </div>

      {error && (
        <Alert variant="destructive" data-testid="dashboard-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Empresas"
          value={stats?.total_empresas || 0}
          icon={Building2}
          color="text-blue-600"
        />
        <StatCard
          title="Equipos Activos"
          value={stats?.equipos_activos || 0}
          icon={Monitor}
          color="text-green-600"
        />
        <StatCard
          title="Bitácoras Pendientes"
          value={stats?.bitacoras_pendientes || 0}
          icon={ClipboardList}
          color="text-amber-600"
        />
        <StatCard
          title="Servicios Activos"
          value={stats?.total_servicios || 0}
          icon={Server}
          color="text-purple-600"
        />
      </div>

    </div>
  );
}