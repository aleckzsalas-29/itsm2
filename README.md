# 🖥️ Sistema ITSM - Gestión Integral de Servicios TI

Sistema completo de gestión de activos informáticos y servicios de tecnología (ITSM - IT Service Management) desarrollado con FastAPI, React y MongoDB.

---

## 🌟 Características Principales

### Módulos del Sistema

- **📊 Dashboard**: Vista general con estadísticas en tiempo real
- **🏢 Gestión de Empresas**: Administración de clientes y sus datos
- **💻 Gestión de Equipos**: Control completo de hardware y especificaciones técnicas
- **📝 Bitácoras de Mantenimiento**: Registro detallado de mantenimientos preventivos y correctivos
- **🔧 Servicios Contratados**: Seguimiento de hosting, licencias y servicios VPS
- **📄 Reportes**: Generación de reportes PDF con logo personalizado
- **👥 Gestión de Usuarios**: Control de acceso con roles (Admin, Cliente, Técnico)
- **⚙️ Configuración**: Personalización del sistema y logo corporativo
- **🆕 Campos Personalizados**: Sistema dinámico para agregar campos custom a cualquier entidad

### Características de Seguridad

- 🔐 Autenticación JWT
- 🔒 Encriptación de contraseñas con Bcrypt
- 🛡️ Encriptación de credenciales sensibles con Fernet
- 👤 Control de acceso basado en roles
- 📧 Notificaciones automáticas por email (SendGrid)

### Reportes y Exportación

- **PDF**: Reportes profesionales con logo personalizado
- **CSV**: Exportación de bitácoras para análisis
- **Filtros**: Por empresa, fechas, técnico, estado

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: MongoDB (Motor - async driver)
- **Autenticación**: JWT (python-jose)
- **Encriptación**: Passlib (Bcrypt), Cryptography (Fernet)
- **Emails**: SendGrid
- **PDFs**: FPDF2

### Frontend
- **Framework**: React 18
- **Enrutamiento**: React Router v6
- **UI Components**: Shadcn/UI + Tailwind CSS
- **HTTP Client**: Axios
- **Notificaciones**: Sonner (toasts)
- **Iconos**: Lucide React

---

## 📁 Estructura del Proyecto

```
/app/
├── backend/                   # Backend FastAPI
├── frontend/                  # Frontend React
├── INSTALL_UBUNTU.md          # Guía de instalación completa
├── CAMPOS_PERSONALIZADOS_GUIDE.md  # Guía de campos custom
└── README.md                  # Este archivo
```

---

## 🚀 Instalación

Ver guía completa en: **[INSTALL_UBUNTU.md](./INSTALL_UBUNTU.md)**

---

## 🔑 Credenciales por Defecto

```
Email: admin@itsm.com
Password: admin123
```

⚠️ **IMPORTANTE**: Cambiar contraseña inmediatamente después del primer login.

---

## 🆕 Campos Personalizados

Permite agregar campos adicionales a Equipos, Bitácoras, Empresas y Servicios.

**Tipos Soportados**: Texto, Número, Fecha, Select, Checkbox

**Documentación**: [CAMPOS_PERSONALIZADOS_GUIDE.md](./CAMPOS_PERSONALIZADOS_GUIDE.md)

---

## 📞 Soporte

- [Guía de Instalación](./INSTALL_UBUNTU.md)
- [Guía de Campos Personalizados](./CAMPOS_PERSONALIZADOS_GUIDE.md)

---

**Desarrollado para gestión eficiente de servicios de TI**
