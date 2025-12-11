# 🔧 Solución: Error de Caracteres en PDFs

## ❌ Error Encontrado
```
Character "•" at index 8 in text is outside the range of characters 
supported by the font used: "helvetica". Please consider using a Unicode font.
```

## ✅ Solución Aplicada

Se cambió la fuente de **helvetica** (que no soporta caracteres especiales) a **DejaVu** (fuente Unicode que soporta emojis y caracteres especiales como •, ✓, 🔧, etc.).

---

## 🚀 Aplicar la Solución en Tu Servidor

### Paso 1: Verificar si tienes las fuentes DejaVu

```bash
ls /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf
```

**Si NO aparecen archivos**, ve al Paso 2.  
**Si SÍ aparecen**, salta al Paso 3.

---

### Paso 2: Instalar Fuentes DejaVu (solo si no las tienes)

**Opción A - Script Automático:**
```bash
cd /opt/itsm
# Copia el script instalar_fuentes_dejavu.sh desde /app/
chmod +x instalar_fuentes_dejavu.sh
sudo ./instalar_fuentes_dejavu.sh
```

**Opción B - Instalación Manual:**
```bash
sudo apt-get update
sudo apt-get install -y fonts-dejavu fonts-dejavu-core fonts-dejavu-extra
```

**Verificar instalación:**
```bash
ls -lh /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf
```

Deberías ver:
```
DejaVuSans-Bold.ttf
DejaVuSans.ttf
```

---

### Paso 3: Actualizar el Código

```bash
cd /opt/itsm

# Backup del archivo actual
cp backend/pdf_service.py backend/pdf_service.py.backup

# Descargar la versión corregida
git pull origin main

# Reiniciar backend
sudo systemctl restart itsm-backend

# Verificar que está corriendo
sudo systemctl status itsm-backend
```

---

### Paso 4: Probar la Generación de PDF

1. Ve a http://108.181.199.108:3000/reportes
2. Selecciona un equipo
3. Elige cualquier plantilla (Moderna, Clásica o Minimalista)
4. Haz clic en "Generar Reporte"
5. El PDF debería generarse sin errores

---

## 🔍 Verificar los Logs

Si el error persiste, revisa los logs:

```bash
# Ver logs del backend
sudo journalctl -u itsm-backend -n 50 --no-pager

# O si usas supervisor
tail -50 /var/log/supervisor/backend.err.log
```

---

## 🎨 Cambios Técnicos Realizados

En el archivo `backend/pdf_service.py`:

**Antes:**
```python
class ITSMReportPDF(FPDF):
    def __init__(self, ...):
        super().__init__()
        # ... código ...
    
    def header(self):
        self.set_font("helvetica", "B", 16)  # ❌ No soporta Unicode
```

**Después:**
```python
class ITSMReportPDF(FPDF):
    def __init__(self, ...):
        super().__init__()
        # Agregar fuentes Unicode
        self.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', uni=True)
        self.add_font('DejaVu', 'B', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', uni=True)
        self.add_font('DejaVu', 'I', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', uni=True)
    
    def header(self):
        self.set_font("DejaVu", "B", 16)  # ✅ Soporta Unicode
```

Además, **todas** las referencias a `"helvetica"` en el archivo fueron reemplazadas por `"DejaVu"` (98 ocurrencias).

---

## 📊 Caracteres Ahora Soportados

Con DejaVu, los PDFs pueden incluir:

✅ **Emojis:** 📦 🔧 ✓ 🔍 ✅ 🔩 📝 📌  
✅ **Símbolos:** • ◦ ▪ ► ▸  
✅ **Checkmarks:** ✓ ✔ ☑  
✅ **Viñetas:** • ‣ ⁃  
✅ **Caracteres especiales:** © ® ™ ° ± × ÷  
✅ **Acentos y ñ:** á é í ó ú ñ Á É Í Ó Ú Ñ  

---

## ⚠️ Solución de Problemas

### Error: "FileNotFoundError: /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

**Causa:** Las fuentes DejaVu no están instaladas.  
**Solución:** Ejecuta el Paso 2 arriba.

---

### Error: "Can't resolve font" o "Font not found"

**Solución 1 - Verificar permisos:**
```bash
sudo chmod 644 /usr/share/fonts/truetype/dejavu/*.ttf
```

**Solución 2 - Actualizar caché de fuentes:**
```bash
sudo fc-cache -f -v
```

---

### El PDF se genera pero los emojis no aparecen

**Causa:** El visor de PDF no soporta la fuente Unicode.  
**Solución:** Abre el PDF con un visor moderno:
- Adobe Acrobat Reader
- Google Chrome
- Firefox
- Evince (Linux)

---

### El PDF funciona pero se ve diferente

**Respuesta:** Es normal. DejaVu tiene un espaciado ligeramente diferente a Helvetica. Los PDFs siguen siendo profesionales y legibles.

---

## ✅ Confirmación de Éxito

Después de aplicar la solución, deberías ver en los PDFs:

✓ Emojis y símbolos correctamente renderizados  
✓ Todas las secciones con íconos visibles  
✓ Checkmarks en mantenimiento preventivo  
✓ Bullets (•) en las listas  
✓ Texto completo sin errores  

---

## 📞 Si Persiste el Problema

Ejecuta este diagnóstico y comparte el resultado:

```bash
echo "=== DIAGNÓSTICO DE FUENTES ==="
echo ""
echo "1. Fuentes instaladas:"
ls -lh /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf 2>&1
echo ""
echo "2. Versión de fpdf2:"
python3 -c "import fpdf; print(fpdf.__version__)" 2>&1
echo ""
echo "3. Estado del backend:"
sudo systemctl status itsm-backend --no-pager -l | head -10
echo ""
echo "4. Últimos errores:"
sudo journalctl -u itsm-backend -n 20 --no-pager | grep -i "error"
```

---

**Versión:** 2.1  
**Fecha:** Diciembre 2024  
**Archivo Modificado:** `backend/pdf_service.py` (cambio de helvetica a DejaVu)
