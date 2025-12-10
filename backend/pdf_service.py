from fpdf import FPDF
from typing import List, Dict, Any
from datetime import datetime
import os

class ITSMReportPDF(FPDF):
    def __init__(self, titulo: str = "Reporte ITSM", logo_path: str = None, sistema_nombre: str = "Sistema ITSM"):
        super().__init__()
        self.titulo = titulo
        self.logo_path = logo_path
        self.sistema_nombre = sistema_nombre
        self.PAGE_WIDTH = 210
        self.MARGIN = 10
        self.width = self.PAGE_WIDTH - 2 * self.MARGIN
    
    def header(self):
        # Si hay logo, agregarlo
        if self.logo_path:
            try:
                self.image(self.logo_path, 10, 8, 30)
                self.set_xy(45, 10)
            except:
                pass
        
        self.set_font("helvetica", "B", 16)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, self.titulo, 0, 1, "C")
        self.set_font("helvetica", "", 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, f"{self.sistema_nombre} - Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", 0, 1, "C")
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f"Página {self.page_no()}", 0, 0, "C")
    
    def add_empresa_section(self, empresa: Dict[str, Any]):
        self.set_font("helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, f"Empresa: {empresa.get('nombre', '')}", 0, 1)
        self.ln(2)
        
        self.set_font("helvetica", "", 9)
        self.set_text_color(51, 65, 85)
        info_text = f"""RFC: {empresa.get('rfc', 'N/A')}
Dirección: {empresa.get('direccion', '')}
Teléfono: {empresa.get('telefono', '')}
Email: {empresa.get('email', '')}
Contacto: {empresa.get('contacto', '')}"""
        self.multi_cell(0, 5, info_text)
        self.ln(5)
    
    def add_equipos_table(self, equipos: List[Dict[str, Any]]):
        if not equipos:
            self.set_font("helvetica", "", 10)
            self.cell(0, 10, "No se encontraron equipos", 0, 1)
            return
        
        headers = ["Nombre", "Tipo", "Marca", "Modelo", "Serie", "Estado", "Ubicación"]
        col_widths = [30, 25, 25, 25, 30, 20, 35]
        
        self.set_font("helvetica", "B", 8)
        self.set_fill_color(15, 23, 42)
        self.set_text_color(255, 255, 255)
        for header, width in zip(headers, col_widths):
            self.cell(width, 7, header, 1, 0, "C", True)
        self.ln()
        
        self.set_font("helvetica", "", 7)
        self.set_text_color(0, 0, 0)
        for equipo in equipos:
            self.cell(col_widths[0], 6, str(equipo.get("nombre", ""))[:20], 1)
            self.cell(col_widths[1], 6, str(equipo.get("tipo", ""))[:15], 1)
            self.cell(col_widths[2], 6, str(equipo.get("marca", ""))[:15], 1)
            self.cell(col_widths[3], 6, str(equipo.get("modelo", ""))[:15], 1)
            self.cell(col_widths[4], 6, str(equipo.get("numero_serie", ""))[:18], 1)
            self.cell(col_widths[5], 6, str(equipo.get("estado", ""))[:12], 1)
            self.cell(col_widths[6], 6, str(equipo.get("ubicacion", ""))[:22], 1)
            self.ln()
    
    def add_bitacoras_table(self, bitacoras: List[Dict[str, Any]]):
        if not bitacoras:
            self.set_font("helvetica", "", 10)
            self.cell(0, 10, "No se encontraron bitácoras", 0, 1)
            return
        
        self.ln(5)
        self.set_font("helvetica", "B", 11)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "Bitácoras de Mantenimiento", 0, 1)
        self.ln(2)
        
        headers = ["Fecha", "Tipo", "Descripción", "Estado", "Costo"]
        col_widths = [25, 30, 80, 25, 20]
        
        self.set_font("helvetica", "B", 8)
        self.set_fill_color(15, 23, 42)
        self.set_text_color(255, 255, 255)
        for header, width in zip(headers, col_widths):
            self.cell(width, 7, header, 1, 0, "C", True)
        self.ln()
        
        self.set_font("helvetica", "", 7)
        self.set_text_color(0, 0, 0)
        for bitacora in bitacoras:
            fecha = bitacora.get("fecha", "")
            if isinstance(fecha, str):
                fecha = fecha[:10]
            self.cell(col_widths[0], 6, str(fecha), 1)
            self.cell(col_widths[1], 6, str(bitacora.get("tipo", ""))[:20], 1)
            self.cell(col_widths[2], 6, str(bitacora.get("descripcion", ""))[:50], 1)
            self.cell(col_widths[3], 6, str(bitacora.get("estado", ""))[:15], 1)
            costo = bitacora.get("costo", 0)
            self.cell(col_widths[4], 6, f"${costo:.2f}" if costo else "-", 1)
            self.ln()
    
    def add_servicios_table(self, servicios: List[Dict[str, Any]]):
        if not servicios:
            return
        
        self.ln(5)
        self.set_font("helvetica", "B", 11)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "Servicios Contratados", 0, 1)
        self.ln(2)
        
        headers = ["Nombre", "Tipo", "Proveedor", "Costo Mensual", "Renovación", "Estado"]
        col_widths = [35, 25, 30, 25, 25, 20]
        
        self.set_font("helvetica", "B", 8)
        self.set_fill_color(15, 23, 42)
        self.set_text_color(255, 255, 255)
        for header, width in zip(headers, col_widths):
            self.cell(width, 7, header, 1, 0, "C", True)
        self.ln()
        
        self.set_font("helvetica", "", 7)
        self.set_text_color(0, 0, 0)
        for servicio in servicios:
            self.cell(col_widths[0], 6, str(servicio.get("nombre", ""))[:25], 1)
            self.cell(col_widths[1], 6, str(servicio.get("tipo", ""))[:18], 1)
            self.cell(col_widths[2], 6, str(servicio.get("proveedor", ""))[:22], 1)
            costo = servicio.get("costo_mensual", 0)
            self.cell(col_widths[3], 6, f"${costo:.2f}", 1)
            fecha_ren = servicio.get("fecha_renovacion", "")
            if isinstance(fecha_ren, str):
                fecha_ren = fecha_ren[:10]
            self.cell(col_widths[4], 6, str(fecha_ren), 1)
            estado = "Activo" if servicio.get("activo", False) else "Inactivo"
            self.cell(col_widths[5], 6, estado, 1)
            self.ln()
    
    def add_resumen(self, equipos: List[Dict], bitacoras: List[Dict], servicios: List[Dict]):
        self.ln(8)
        self.set_font("helvetica", "B", 11)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "Resumen", 0, 1)
        self.ln(2)
        
        total_equipos = len(equipos)
        equipos_activos = sum(1 for e in equipos if e.get("estado") == "Activo")
        total_mantenimientos = len(bitacoras)
        costo_servicios = sum(s.get("costo_mensual", 0) for s in servicios if s.get("activo", False))
        
        self.set_font("helvetica", "", 9)
        self.set_text_color(51, 65, 85)
        resumen = f"""Total de Equipos: {total_equipos}
Equipos Activos: {equipos_activos}
Mantenimientos Registrados: {total_mantenimientos}
Costo Mensual en Servicios: ${costo_servicios:.2f}"""
        self.multi_cell(0, 5, resumen)

class PDFService:
    def __init__(self):
        # Usar ruta relativa al directorio actual del script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(base_dir, "pdfs")
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def get_config(self, db):
        config = await db.configuracion.find_one({})
        return config
    
    def generate_empresa_report(self, empresa: Dict, equipos: List[Dict], 
                                  bitacoras: List[Dict], servicios: List[Dict],
                                  logo_path: str = None, sistema_nombre: str = "Sistema ITSM") -> str:
        pdf = ITSMReportPDF(f"Reporte de Empresa - {empresa.get('nombre', '')}", logo_path, sistema_nombre)
        pdf.add_page()
        
        pdf.add_empresa_section(empresa)
        
        if equipos:
            pdf.add_equipos_table(equipos)
        
        if bitacoras:
            pdf.add_bitacoras_table(bitacoras)
        
        if servicios:
            pdf.add_servicios_table(servicios)
        
        pdf.add_resumen(equipos, bitacoras, servicios)
        
        filename = f"empresa_{empresa.get('_id', 'unknown')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filename
    
    def generate_equipo_report(self, equipo: Dict, bitacoras: List[Dict],
                                logo_path: str = None, sistema_nombre: str = "Sistema ITSM") -> str:
        pdf = ITSMReportPDF(f"Reporte de Equipo - {equipo.get('nombre', '')}", logo_path, sistema_nombre)
        pdf.add_page()
        
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 8, f"Equipo: {equipo.get('nombre', '')}", 0, 1)
        pdf.ln(2)
        
        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(51, 65, 85)
        info = f"""Tipo: {equipo.get('tipo', '')}
Marca: {equipo.get('marca', '')}
Modelo: {equipo.get('modelo', '')}
Número de Serie: {equipo.get('numero_serie', '')}
Ubicación: {equipo.get('ubicacion', '')}
Estado: {equipo.get('estado', '')}"""
        pdf.multi_cell(0, 5, info)
        
        if bitacoras:
            pdf.add_bitacoras_table(bitacoras)
        
        filename = f"equipo_{equipo.get('_id', 'unknown')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filename
    
    def generate_bitacoras_report(self, bitacoras: List[Dict], empresa_nombre: str = None, 
                                   logo_path: str = None, sistema_nombre: str = "Sistema ITSM",
                                   campos_seleccionados: List[str] = None):
        """Generar reporte PDF de bitácoras con campos seleccionables"""
        
        titulo = f"Reporte de Bitácoras"
        if empresa_nombre:
            titulo += f" - {empresa_nombre}"
        
        pdf = ITSMReportPDF(titulo=titulo, logo_path=logo_path, sistema_nombre=sistema_nombre)
        pdf.add_page()
        
        # Definir todos los campos disponibles
        campos_disponibles = {
            'fecha': 'Fecha',
            'equipo': 'Equipo',
            'tipo': 'Tipo',
            'descripcion': 'Descripción',
            'tecnico': 'Técnico',
            'estado': 'Estado',
            'observaciones': 'Observaciones',
            'tiempo_estimado': 'Tiempo Est.',
            'tiempo_real': 'Tiempo Real'
        }
        
        # Si no se especifican campos, usar todos
        if not campos_seleccionados:
            campos_seleccionados = list(campos_disponibles.keys())
        
        # Filtrar solo campos válidos
        campos_a_mostrar = {k: v for k, v in campos_disponibles.items() if k in campos_seleccionados}
        
        if not bitacoras:
            pdf.set_font("helvetica", "I", 10)
            pdf.cell(0, 10, "No hay bitácoras para mostrar", 0, 1, "C")
        else:
            # Título de sección
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 8, f"Total de Bitácoras: {len(bitacoras)}", 0, 1)
            pdf.ln(3)
            
            # Crear tabla con campos seleccionados
            pdf.set_font("helvetica", "B", 8)
            pdf.set_fill_color(241, 245, 249)
            pdf.set_text_color(51, 65, 85)
            
            # Calcular anchos de columna dinámicamente
            num_campos = len(campos_a_mostrar)
            col_width = (pdf.PAGE_WIDTH - 2 * pdf.MARGIN) / num_campos
            
            # Headers
            for campo, titulo in campos_a_mostrar.items():
                pdf.cell(col_width, 7, titulo, 1, 0, "C", True)
            pdf.ln()
            
            # Datos
            pdf.set_font("helvetica", "", 7)
            for bitacora in bitacoras:
                for campo in campos_a_mostrar.keys():
                    value = bitacora.get(campo, 'N/A')
                    
                    # Formatear según tipo
                    if campo == 'fecha' and value != 'N/A':
                        if isinstance(value, str):
                            try:
                                dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                                value = dt.strftime('%d/%m/%Y')
                            except:
                                pass
                    elif campo in ['tiempo_estimado', 'tiempo_real']:
                        value = f"{value} min" if value and value != 'N/A' else 'N/A'
                    elif campo == 'descripcion' and len(str(value)) > 30:
                        value = str(value)[:27] + '...'
                    
                    pdf.cell(col_width, 6, str(value), 1, 0, "C")
                pdf.ln()
        
        filename = f"bitacoras_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filename
    
    def generate_bitacoras_report_detailed(self, bitacoras: List[Dict], empresa_nombre: str = None, 
                                           logo_path: str = None, sistema_nombre: str = "Sistema ITSM"):
        """Generar reporte PDF detallado de bitácoras con todo el contenido"""
        
        titulo = f"Reporte Detallado de Bitácoras"
        if empresa_nombre:
            titulo += f" - {empresa_nombre}"
        
        pdf = ITSMReportPDF(titulo=titulo, logo_path=logo_path, sistema_nombre=sistema_nombre)
        pdf.add_page()
        
        if not bitacoras:
            pdf.set_font("helvetica", "I", 10)
            pdf.cell(0, 10, "No hay bitácoras para mostrar", 0, 1, "C")
        else:
            # Título de sección
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 8, f"Total de Bitácoras: {len(bitacoras)}", 0, 1)
            pdf.ln(5)
            
            # Procesar cada bitácora detalladamente
            for idx, bitacora in enumerate(bitacoras, 1):
                # Encabezado de bitácora
                pdf.set_fill_color(30, 41, 59)
                pdf.set_text_color(255, 255, 255)
                pdf.set_font("helvetica", "B", 10)
                pdf.cell(0, 8, f"Bitácora #{idx}", 0, 1, "L", True)
                pdf.ln(2)
                
                # Información básica
                pdf.set_text_color(51, 65, 85)
                pdf.set_font("helvetica", "B", 9)
                
                # Fecha
                fecha_str = "N/A"
                if bitacora.get('fecha'):
                    try:
                        if isinstance(bitacora['fecha'], str):
                            dt = datetime.fromisoformat(bitacora['fecha'].replace('Z', '+00:00'))
                        else:
                            dt = bitacora['fecha']
                        fecha_str = dt.strftime('%d/%m/%Y %H:%M')
                    except:
                        fecha_str = str(bitacora['fecha'])
                
                pdf.cell(40, 6, "Fecha:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, fecha_str, 0, 1)
                
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Equipo:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, bitacora.get('equipo', 'N/A'), 0, 1)
                
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Tipo:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, bitacora.get('tipo', 'N/A'), 0, 1)
                
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Técnico:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, bitacora.get('tecnico', 'N/A'), 0, 1)
                
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Estado:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, bitacora.get('estado', 'N/A'), 0, 1)
                
                # Tiempos
                tiempo_est = bitacora.get('tiempo_estimado')
                tiempo_real = bitacora.get('tiempo_real')
                if tiempo_est or tiempo_real:
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(40, 6, "Tiempo Estimado:", 0, 0)
                    pdf.set_font("helvetica", "", 9)
                    pdf.cell(60, 6, f"{tiempo_est} min" if tiempo_est else "N/A", 0, 0)
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(40, 6, "Tiempo Real:", 0, 0)
                    pdf.set_font("helvetica", "", 9)
                    pdf.cell(0, 6, f"{tiempo_real} min" if tiempo_real else "N/A", 0, 1)
                
                pdf.ln(3)
                
                # Descripción
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(0, 6, "Descripción:", 0, 1)
                pdf.set_font("helvetica", "", 8)
                descripcion = bitacora.get('descripcion', 'N/A')
                pdf.multi_cell(0, 5, descripcion)
                pdf.ln(2)
                
                # Mantenimiento Preventivo
                preventivo_items = []
                if bitacora.get('limpieza_fisica'): preventivo_items.append("Limpieza física")
                if bitacora.get('actualizacion_software'): preventivo_items.append("Actualización de software")
                if bitacora.get('revision_hardware'): preventivo_items.append("Revisión de hardware")
                if bitacora.get('respaldo_datos'): preventivo_items.append("Respaldo de datos")
                if bitacora.get('optimizacion_sistema'): preventivo_items.append("Optimización del sistema")
                
                if preventivo_items:
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Mantenimiento Preventivo:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    for item in preventivo_items:
                        pdf.cell(10, 5, "", 0, 0)
                        pdf.cell(0, 5, f"• {item}", 0, 1)
                    pdf.ln(2)
                
                # Mantenimiento Correctivo
                if bitacora.get('diagnostico_problema'):
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Diagnóstico del Problema:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    pdf.multi_cell(0, 5, bitacora['diagnostico_problema'])
                    pdf.ln(2)
                
                if bitacora.get('solucion_aplicada'):
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Solución Aplicada:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    pdf.multi_cell(0, 5, bitacora['solucion_aplicada'])
                    pdf.ln(2)
                
                if bitacora.get('componentes_reemplazados'):
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Componentes Reemplazados:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    pdf.multi_cell(0, 5, bitacora['componentes_reemplazados'])
                    pdf.ln(2)
                
                # Observaciones
                if bitacora.get('observaciones'):
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Observaciones:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    pdf.multi_cell(0, 5, bitacora['observaciones'])
                    pdf.ln(2)
                
                # Anotaciones extras
                if bitacora.get('anotaciones_extras'):
                    pdf.set_font("helvetica", "B", 9)
                    pdf.cell(0, 6, "Anotaciones Adicionales:", 0, 1)
                    pdf.set_font("helvetica", "", 8)
                    pdf.multi_cell(0, 5, bitacora['anotaciones_extras'])
                    pdf.ln(2)
                
                # Separador entre bitácoras
                if idx < len(bitacoras):
                    pdf.ln(3)
                    pdf.set_draw_color(203, 213, 225)
                    pdf.line(pdf.MARGIN, pdf.get_y(), pdf.PAGE_WIDTH - pdf.MARGIN, pdf.get_y())
                    pdf.ln(5)
                
                # Verificar espacio para nueva bitácora
                if idx < len(bitacoras) and pdf.get_y() > 240:
                    pdf.add_page()
        
        filename = f"bitacoras_detallado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        
        return filename

def generate_bitacoras_report_detailed(self, bitacoras, empresa_nombre=None, logo_path=None, sistema_nombre="Sistema ITSM"):
        """Generar reporte PDF detallado de bitácoras"""
        titulo = f"Reporte Detallado de Bitácoras"
        if empresa_nombre:
            titulo += f" - {empresa_nombre}"
        
        pdf = ITSMReportPDF(titulo=titulo, logo_path=logo_path, sistema_nombre=sistema_nombre)
        pdf.add_page()
        
        if not bitacoras:
            pdf.set_font("helvetica", "I", 10)
            pdf.cell(0, 10, "No hay bitácoras para mostrar", 0, 1, "C")
        else:
            pdf.set_font("helvetica", "B", 12)
            pdf.cell(0, 8, f"Total: {len(bitacoras)}", 0, 1)
            pdf.ln(5)
            
            for idx, b in enumerate(bitacoras, 1):
                pdf.set_fill_color(30, 41, 59)
                pdf.set_text_color(255, 255, 255)
                pdf.set_font("helvetica", "B", 10)
                pdf.cell(0, 8, f"Bitácora #{idx}", 0, 1, "L", True)
                pdf.ln(2)
                
                pdf.set_text_color(51, 65, 85)
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Equipo:", 0, 0)
                pdf.set_font("helvetica", "", 9)
                pdf.cell(0, 6, b.get('equipo', 'N/A'), 0, 1)
                
                pdf.set_font("helvetica", "B", 9)
                pdf.cell(40, 6, "Descripción:", 0, 1)
                pdf.set_font("helvetica", "", 8)
                pdf.multi_cell(0, 5, b.get('descripcion', 'N/A'))
                
                if idx < len(bitacoras):
                    pdf.ln(3)
                    if pdf.get_y() > 240:
                        pdf.add_page()
        
        filename = f"bitacoras_detallado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        return filename

pdf_service = PDFService()
