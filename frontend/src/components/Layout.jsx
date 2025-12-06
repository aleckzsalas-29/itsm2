import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  Building2,
  Monitor,
  ClipboardList,
  Server,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Empresas', path: '/empresas', icon: Building2 },
    { name: 'Equipos', path: '/equipos', icon: Monitor },
    { name: 'Bitácoras', path: '/bitacoras', icon: ClipboardList },
    { name: 'Servicios', path: '/servicios', icon: Server },
    { name: 'Reportes', path: '/reportes', icon: FileText },
  ];

  if (isAdmin()) {
    navigationItems.push(
      { name: 'Usuarios', path: '/usuarios', icon: Users },
      { name: 'Configuración', path: '/configuracion', icon: Settings }
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="layout">
      {/* Sidebar Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-slate-200 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Sistema ITSM
            </h1>
          </div>
          <div className="flex-1 flex flex-col">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{user?.nombre}</p>
                  <p className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>{user?.rol}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-900"
                  data-testid="logout-button"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Sistema ITSM
        </h1>
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="ghost"
          size="sm"
          data-testid="mobile-menu-button"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white" data-testid="mobile-menu">
          <div className="pt-20 pb-3 space-y-1 px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center px-3 py-2 text-base font-medium rounded-sm ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-700 hover:bg-slate-100 mt-4"
            >
              <LogOut className="mr-3 h-5 w-5 text-slate-400" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
