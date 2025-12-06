from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        try:
            return str(ObjectId(str(v)))
        except:
            raise ValueError("Not a valid ObjectId")

class Usuario(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    email: EmailStr
    nombre: str
    password_hash: str
    rol: str  # administrador, cliente, tecnico
    activo: bool = True
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Empresa(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    nombre: str
    rfc: Optional[str] = None
    direccion: str
    telefono: str
    email: EmailStr
    contacto: str
    activo: bool = True
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    campos_personalizados: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Equipo(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    empresa_id: PyObjectId
    nombre: str
    tipo: str
    marca: str
    modelo: str
    numero_serie: str
    usuario_windows: Optional[str] = None
    correo_usuario: Optional[EmailStr] = None
    password_windows_encrypted: Optional[str] = None
    password_correo_encrypted: Optional[str] = None
    ubicacion: str
    estado: str = "Activo"  # Activo, Inactivo, Mantenimiento
    memoria_ram: Optional[str] = None
    disco_duro: Optional[str] = None
    espacio_disponible: Optional[str] = None
    procesador: Optional[str] = None
    componentes: Optional[str] = None
    notas: Optional[str] = None
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: datetime = Field(default_factory=datetime.utcnow)
    campos_personalizados: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Bitacora(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    equipo_id: PyObjectId
    empresa_id: PyObjectId
    tipo: str  # Mantenimiento preventivo, Correctivo, Instalación, etc.
    descripcion: str
    tecnico_id: PyObjectId
    fecha: datetime = Field(default_factory=datetime.utcnow)
    estado: str = "Pendiente"  # Pendiente, En Progreso, Completado
    observaciones: Optional[str] = None
    costo: Optional[float] = None
    tiempo_estimado: Optional[int] = None  # en minutos
    tiempo_real: Optional[int] = None
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    campos_personalizados: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Servicio(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    empresa_id: PyObjectId
    tipo: str  # Hosting, Licencia, Servidor VPS
    nombre: str
    proveedor: str
    costo_mensual: float
    fecha_inicio: datetime
    fecha_renovacion: datetime
    activo: bool = True
    credenciales_encrypted: Optional[str] = None
    url_acceso: Optional[str] = None
    notas: Optional[str] = None
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    campos_personalizados: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Configuracion(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    nombre_sistema: str = "Sistema ITSM"
    logo_url: Optional[str] = None
    email_notificaciones: Optional[EmailStr] = None
    campos_equipos: List[Dict[str, str]] = Field(default_factory=list)
    campos_empresas: List[Dict[str, str]] = Field(default_factory=list)
    campos_bitacoras: List[Dict[str, str]] = Field(default_factory=list)
    campos_servicios: List[Dict[str, str]] = Field(default_factory=list)
    actualizado_en: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}