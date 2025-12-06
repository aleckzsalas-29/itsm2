from fpdf import FPDF
from typing import List, Dict, Any
from datetime import datetime
import os

class ITSMReportPDF(FPDF):
    def __init__(self, titulo: str = "Reporte ITSM"):
        super().__init__()
        self.titulo = titulo
        self.PAGE_WIDTH = 210
        self.MARGIN = 10
        self.width = self.PAGE_WIDTH - 2 * self.MARGIN
    
    def header(self):
        self.set_font("helvetica", "B", 16)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, self.titulo, 0, 1, "C")
        self.set_font("helvetica", "", 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", 0, 1, "C")
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
        self.output_dir = "/app/backend/pdfs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_empresa_report(self, empresa: Dict, equipos: List[Dict], 
                                  bitacoras: List[Dict], servicios: List[Dict]) -> str:
        pdf = ITSMReportPDF(f"Reporte de Empresa - {empresa.get('nombre', '')}")
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
    
    def generate_equipo_report(self, equipo: Dict, bitacoras: List[Dict]) -> str:
        pdf = ITSMReportPDF(f"Reporte de Equipo - {equipo.get('nombre', '')}")
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

pdf_service = PDFService()