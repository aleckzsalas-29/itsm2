#!/bin/bash

# Script para actualizar la funcionalidad "Ver Historial" en el servidor de producción
# Este script debe ejecutarse en /opt/itsm/

echo "========================================="
echo " ACTUALIZACIÓN: Ver Historial de Equipos"
echo "========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "frontend/src/pages/Equipos.jsx" ]; then
    echo "❌ ERROR: No se encontró el archivo Equipos.jsx"
    echo "   Por favor, ejecuta este script desde /opt/itsm/"
    exit 1
fi

# Crear backup del archivo actual
echo "📦 Creando backup del archivo actual..."
cp frontend/src/pages/Equipos.jsx frontend/src/pages/Equipos.jsx.backup_$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

# Descargar el archivo actualizado desde el repositorio local
echo ""
echo "⬇️  Descargando archivo actualizado..."

# Aquí el usuario debe copiar el archivo Equipos.jsx desde /app/frontend/src/pages/Equipos.jsx
# al servidor /opt/itsm/frontend/src/pages/Equipos.jsx

echo ""
echo "📝 INSTRUCCIONES:"
echo "   1. Copia el archivo Equipos.jsx actualizado a /opt/itsm/frontend/src/pages/"
echo "   2. Reinicia el frontend con: pm2 restart frontend"
echo ""
echo "   Ubicación del archivo actualizado:"
echo "   /app/frontend/src/pages/Equipos.jsx"
echo ""

read -p "¿Has copiado el archivo actualizado? (s/n): " respuesta

if [ "$respuesta" = "s" ] || [ "$respuesta" = "S" ]; then
    echo ""
    echo "🔄 Reiniciando frontend..."
    pm2 restart frontend
    
    echo ""
    echo "✅ ACTUALIZACIÓN COMPLETADA"
    echo ""
    echo "🎉 La funcionalidad 'Ver Historial' ha sido agregada exitosamente."
    echo "   Ahora verás un botón azul con ícono de reloj en cada equipo."
    echo "   Al hacer clic, se mostrará un modal con todo el historial de mantenimientos."
else
    echo ""
    echo "⚠️  Actualización cancelada. El backup está disponible en:"
    echo "   frontend/src/pages/Equipos.jsx.backup_*"
fi
