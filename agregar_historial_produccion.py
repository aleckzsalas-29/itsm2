#!/usr/bin/env python3
"""
Script para agregar la funcionalidad "Ver Historial" al archivo Equipos.jsx
EJECUTAR EN: /opt/itsm/
"""
import os
import shutil
from datetime import datetime

# Verificar que estamos en el directorio correcto
if not os.path.exists('frontend/src/pages/Equipos.jsx'):
    print("❌ ERROR: No se encontró el archivo Equipos.jsx")
    print("   Por favor, ejecuta este script desde /opt/itsm/")
    exit(1)

print("=" * 50)
print(" ACTUALIZACIÓN: Ver Historial de Equipos")
print("=" * 50)
print()

# Crear backup
backup_name = f'frontend/src/pages/Equipos.jsx.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
shutil.copy('frontend/src/pages/Equipos.jsx', backup_name)
print(f"📦 Backup creado: {backup_name}")

# Leer el archivo actual
with open('frontend/src/pages/Equipos.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Verificar si ya tiene la funcionalidad
if 'historialOpen' in content:
    print("⚠️  La funcionalidad 'Ver Historial' ya está implementada.")
    print("   No se realizarán cambios.")
    exit(0)

print()
print("🔧 Aplicando cambios...")

# 1. Actualizar el import de lucide-react para incluir History
if "import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Loader2 } from 'lucide-react';" in content:
    content = content.replace(
        "import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Loader2 } from 'lucide-react';",
        "import { Plus, Edit, Trash2, Monitor, Eye, EyeOff, Loader2, History } from 'lucide-react';"
    )
    print("✅ 1/5 - Import de History agregado")
else:
    print("⚠️  1/5 - Import de lucide-react no encontrado o ya modificado")

# 2. Agregar estados para el historial después del estado showPasswords
if "const [showPasswords, setShowPasswords] = useState({});" in content:
    content = content.replace(
        "  const [showPasswords, setShowPasswords] = useState({});",
        """  const [showPasswords, setShowPasswords] = useState({});
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialData, setHistorialData] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [selectedEquipoNombre, setSelectedEquipoNombre] = useState('');"""
    )
    print("✅ 2/5 - Estados del historial agregados")
else:
    print("⚠️  2/5 - Estados no agregados (puede estar ya presente)")

# 3. Agregar la función fetchHistorial después de togglePasswordVisibility
fetch_historial_function = """
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
"""

toggle_password_end = """  };

  const handleSubmit = async (e) => {"""

if toggle_password_end in content:
    content = content.replace(
        toggle_password_end,
        f"""  }};
{fetch_historial_function}
  const handleSubmit = async (e) => {{"""
    )
    print("✅ 3/5 - Función fetchHistorial agregada")
else:
    print("⚠️  3/5 - Función fetchHistorial no agregada")

# 4. Agregar botón de historial en las acciones (antes del botón de editar)
actions_old = """                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(equipo)}
                      className="text-slate-600 hover:text-slate-900"
                      data-testid="edit-equipo-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>"""

actions_new = """                  <TableCell className="text-right space-x-2">
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
                    </Button>"""

if actions_old in content:
    content = content.replace(actions_old, actions_new)
    print("✅ 4/5 - Botón de historial agregado en acciones")
else:
    print("⚠️  4/5 - Botón de historial no agregado")

# 5. Agregar el modal de historial antes del cierre del return
historial_modal = """
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
    </div>"""

# Encontrar el cierre del componente principal
close_tag = """      </Dialog>
    </div>
  );
}"""

if close_tag in content:
    content = content.replace(close_tag, historial_modal + """
  );
}""")
    print("✅ 5/5 - Modal de historial agregado")
else:
    print("⚠️  5/5 - Modal de historial no agregado")

# Guardar el archivo modificado
with open('frontend/src/pages/Equipos.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("=" * 50)
print("✅ ACTUALIZACIÓN COMPLETADA")
print("=" * 50)
print()
print("📝 Próximos pasos:")
print("   1. Reinicia el frontend: pm2 restart frontend")
print("   2. Verifica en el navegador")
print()
print("🎉 Ahora verás un botón azul con ícono de reloj en cada equipo.")
print("   Al hacer clic, se mostrará todo el historial de mantenimientos.")
print()
print(f"💾 Backup disponible en: {backup_name}")
