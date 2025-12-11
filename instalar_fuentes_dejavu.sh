#!/bin/bash

echo "========================================="
echo " Instalación de Fuentes DejaVu para PDFs"
echo "========================================="
echo ""

# Verificar si las fuentes ya están instaladas
if [ -f "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" ]; then
    echo "✅ Las fuentes DejaVu ya están instaladas"
    echo ""
    echo "Ubicación: /usr/share/fonts/truetype/dejavu/"
    ls -lh /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf 2>/dev/null
    exit 0
fi

echo "📦 Las fuentes DejaVu no están instaladas."
echo "   Se procederá a instalarlas..."
echo ""

# Actualizar repositorios
echo "1. Actualizando repositorios..."
sudo apt-get update -qq

# Instalar fuentes DejaVu
echo ""
echo "2. Instalando fuentes DejaVu..."
sudo apt-get install -y fonts-dejavu fonts-dejavu-core fonts-dejavu-extra

# Verificar instalación
echo ""
echo "3. Verificando instalación..."
if [ -f "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" ]; then
    echo "✅ Fuentes instaladas correctamente"
    echo ""
    echo "Fuentes disponibles:"
    ls -lh /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf
else
    echo "❌ Error: Las fuentes no se instalaron correctamente"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ INSTALACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Ahora puedes generar reportes PDF con emojis y caracteres especiales."
