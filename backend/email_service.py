from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'noreply@itsm.com')

class EmailService:
    def __init__(self):
        self.api_key = SENDGRID_API_KEY
        self.sender = SENDER_EMAIL
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        if not self.api_key:
            print("SendGrid API key not configured")
            return False
        
        try:
            message = Mail(
                from_email=self.sender,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    def send_maintenance_notification(self, to_email: str, equipo: str, fecha: str, tecnico: str):
        subject = f"Mantenimiento programado - {equipo}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #0F172A;">Notificación de Mantenimiento</h2>
                <p>Se ha programado un mantenimiento para el siguiente equipo:</p>
                <div style="background-color: #F1F5F9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Equipo:</strong> {equipo}</p>
                    <p><strong>Fecha:</strong> {fecha}</p>
                    <p><strong>Técnico asignado:</strong> {tecnico}</p>
                </div>
                <p>Por favor, asegúrese de que el equipo esté disponible en la fecha indicada.</p>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748B;">Este es un mensaje automático del Sistema ITSM.</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_report_notification(self, to_email: str, empresa: str, tipo_reporte: str):
        subject = f"Reporte generado - {empresa}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #0F172A;">Reporte Generado</h2>
                <p>Se ha generado un nuevo reporte para su empresa:</p>
                <div style="background-color: #F1F5F9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Empresa:</strong> {empresa}</p>
                    <p><strong>Tipo de reporte:</strong> {tipo_reporte}</p>
                </div>
                <p>El reporte está disponible para descargar en el sistema.</p>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748B;">Este es un mensaje automático del Sistema ITSM.</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)

email_service = EmailService()