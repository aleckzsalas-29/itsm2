from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Body, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import os
import logging

from models import Usuario, Empresa, Equipo, Bitacora, Servicio, Configuracion
from auth import verify_password, get_password_hash, create_access_token, verify_token, encrypt_password, decrypt_password
from database import db, init_db
from email_service import email_service
from pdf_service import pdf_service

app = FastAPI(title="Sistema ITSM API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    usuario: Dict[str, Any]

class CreateUsuarioRequest(BaseModel):
    email: EmailStr
    nombre: str
    password: str
    rol: str

class EmpresaCreate(BaseModel):
    nombre: str
    rfc: Optional[str] = None
    direccion: str
    telefono: str
    email: EmailStr
    contacto: str
    campos_personalizados: Dict[str, Any] = {}

class EquipoCreate(BaseModel):
    empresa_id: str
    nombre: str
    tipo: str
    marca: str
    modelo: str
    numero_serie: str
    usuario_windows: Optional[str] = None
    correo_usuario: Optional[EmailStr] = None
    password_windows: Optional[str] = None
    password_correo: Optional[str] = None
    ubicacion: str
    estado: str = "Activo"
    memoria_ram: Optional[str] = None
    disco_duro: Optional[str] = None
    espacio_disponible: Optional[str] = None
    procesador: Optional[str] = None
    componentes: Optional[str] = None
    notas: Optional[str] = None
    campos_personalizados: Dict[str, Any] = {}

class BitacoraCreate(BaseModel):
    equipo_id: str
    empresa_id: str
    tipo: str
    descripcion: str
    tecnico_id: str
    fecha: Optional[datetime] = None
    estado: str = "Pendiente"
    observaciones: Optional[str] = None
    tiempo_estimado: Optional[int] = None
    tiempo_real: Optional[int] = None
    limpieza_fisica: Optional[bool] = None
    actualizacion_software: Optional[bool] = None
    revision_hardware: Optional[bool] = None
    respaldo_datos: Optional[bool] = None
    optimizacion_sistema: Optional[bool] = None
    diagnostico_problema: Optional[str] = None
    solucion_aplicada: Optional[str] = None
    componentes_reemplazados: Optional[str] = None
    anotaciones_extras: Optional[str] = None
    campos_personalizados: Dict[str, Any] = {}

class ServicioCreate(BaseModel):
    empresa_id: str
    tipo: str
    nombre: str
    proveedor: str
    costo_mensual: float
    fecha_inicio: datetime
    fecha_renovacion: datetime
    activo: bool = True
    credenciales: Optional[str] = None
    url_acceso: Optional[str] = None
    notas: Optional[str] = None
    campos_personalizados: Dict[str, Any] = {}

class ConfiguracionUpdate(BaseModel):
    nombre_sistema: Optional[str] = None
    logo_url: Optional[str] = None
    email_notificaciones: Optional[EmailStr] = None
    campos_equipos: Optional[List[Dict[str, str]]] = None
    campos_empresas: Optional[List[Dict[str, str]]] = None
    campos_bitacoras: Optional[List[Dict[str, str]]] = None
    campos_servicios: Optional[List[Dict[str, str]]] = None

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    
    token = authorization.split("Bearer ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = await db.usuarios.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user["_id"] = str(user["_id"])
    return user

async def get_admin_user(current_user: Dict = Depends(get_current_user)):
    if current_user.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return current_user

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.usuarios.find_one({"email": request.email})
    
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not user.get("activo", True):
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "rol": user["rol"]})
    
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    
    return {"token": token, "usuario": user}

@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    return current_user

@api_router.get("/usuarios")
async def get_usuarios(current_user: Dict = Depends(get_admin_user)):
    usuarios = []
    async for usuario in db.usuarios.find({}):
        usuario["_id"] = str(usuario["_id"])
        usuario.pop("password_hash", None)
        usuarios.append(usuario)
    return usuarios

@api_router.post("/usuarios")
async def create_usuario(request: CreateUsuarioRequest, current_user: Dict = Depends(get_admin_user)):
    existing = await db.usuarios.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    usuario = Usuario(
        email=request.email,
        nombre=request.nombre,
        password_hash=get_password_hash(request.password),
        rol=request.rol
    )
    
    result = await db.usuarios.insert_one(usuario.model_dump(by_alias=True, exclude={"id"}))
    return {"id": str(result.inserted_id)}

@api_router.put("/usuarios/{usuario_id}")
async def update_usuario(usuario_id: str, data: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_admin_user)):
    data.pop("_id", None)
    data.pop("password_hash", None)
    
    if "password" in data:
        data["password_hash"] = get_password_hash(data.pop("password"))
    
    result = await db.usuarios.update_one(
        {"_id": ObjectId(usuario_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario actualizado"}

@api_router.delete("/usuarios/{usuario_id}")
async def delete_usuario(usuario_id: str, current_user: Dict = Depends(get_admin_user)):
    result = await db.usuarios.delete_one({"_id": ObjectId(usuario_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado"}

@api_router.get("/empresas")
async def get_empresas(current_user: Dict = Depends(get_current_user)):
    empresas = []
    async for empresa in db.empresas.find({}):
        empresa["_id"] = str(empresa["_id"])
        empresas.append(empresa)
    return empresas

@api_router.get("/empresas/{empresa_id}")
async def get_empresa(empresa_id: str, current_user: Dict = Depends(get_current_user)):
    empresa = await db.empresas.find_one({"_id": ObjectId(empresa_id)})
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    empresa["_id"] = str(empresa["_id"])
    return empresa

@api_router.post("/empresas")
async def create_empresa(request: EmpresaCreate, current_user: Dict = Depends(get_current_user)):
    empresa = Empresa(**request.model_dump())
    result = await db.empresas.insert_one(empresa.model_dump(by_alias=True, exclude={"id"}))
    return {"id": str(result.inserted_id)}

@api_router.put("/empresas/{empresa_id}")
async def update_empresa(empresa_id: str, data: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    data.pop("_id", None)
    data["actualizado_en"] = datetime.utcnow()
    
    result = await db.empresas.update_one(
        {"_id": ObjectId(empresa_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    return {"message": "Empresa actualizada"}

@api_router.delete("/empresas/{empresa_id}")
async def delete_empresa(empresa_id: str, current_user: Dict = Depends(get_admin_user)):
    result = await db.empresas.delete_one({"_id": ObjectId(empresa_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return {"message": "Empresa eliminada"}

@api_router.get("/equipos")
async def get_equipos(empresa_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if empresa_id:
        query["empresa_id"] = empresa_id
    
    equipos = []
    async for equipo in db.equipos.find(query):
        equipo["_id"] = str(equipo["_id"])
        equipo.pop("password_windows_encrypted", None)
        equipo.pop("password_correo_encrypted", None)
        equipos.append(equipo)
    return equipos

@api_router.get("/equipos/{equipo_id}")
async def get_equipo(equipo_id: str, show_passwords: bool = False, current_user: Dict = Depends(get_current_user)):
    equipo = await db.equipos.find_one({"_id": ObjectId(equipo_id)})
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    equipo["_id"] = str(equipo["_id"])
    
    if show_passwords and (current_user.get("rol") == "administrador" or current_user.get("rol") == "tecnico"):
        if equipo.get("password_windows_encrypted"):
            try:
                equipo["password_windows"] = decrypt_password(equipo["password_windows_encrypted"])
            except:
                equipo["password_windows"] = "Error al descifrar"
        
        if equipo.get("password_correo_encrypted"):
            try:
                equipo["password_correo"] = decrypt_password(equipo["password_correo_encrypted"])
            except:
                equipo["password_correo"] = "Error al descifrar"
    
    equipo.pop("password_windows_encrypted", None)
    equipo.pop("password_correo_encrypted", None)
    
    return equipo

@api_router.post("/equipos")
async def create_equipo(request: EquipoCreate, current_user: Dict = Depends(get_current_user)):
    equipo_data = request.model_dump()
    
    if request.password_windows:
        equipo_data["password_windows_encrypted"] = encrypt_password(request.password_windows)
        equipo_data.pop("password_windows")
    
    if request.password_correo:
        equipo_data["password_correo_encrypted"] = encrypt_password(request.password_correo)
        equipo_data.pop("password_correo")
    
    equipo = Equipo(**equipo_data)
    result = await db.equipos.insert_one(equipo.model_dump(by_alias=True, exclude={"id"}))
    return {"id": str(result.inserted_id)}

@api_router.put("/equipos/{equipo_id}")
async def update_equipo(equipo_id: str, data: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    data.pop("_id", None)
    data["actualizado_en"] = datetime.utcnow()
    
    if "password_windows" in data and data["password_windows"]:
        data["password_windows_encrypted"] = encrypt_password(data.pop("password_windows"))
    
    if "password_correo" in data and data["password_correo"]:
        data["password_correo_encrypted"] = encrypt_password(data.pop("password_correo"))
    
    result = await db.equipos.update_one(
        {"_id": ObjectId(equipo_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    return {"message": "Equipo actualizado"}

@api_router.delete("/equipos/{equipo_id}")
async def delete_equipo(equipo_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.equipos.delete_one({"_id": ObjectId(equipo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return {"message": "Equipo eliminado"}

@api_router.get("/bitacoras")
async def get_bitacoras(equipo_id: Optional[str] = None, empresa_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if equipo_id:
        query["equipo_id"] = equipo_id
    if empresa_id:
        query["empresa_id"] = empresa_id
    
    bitacoras = []
    async for bitacora in db.bitacoras.find(query).sort("fecha", -1):
        bitacora["_id"] = str(bitacora["_id"])
        bitacoras.append(bitacora)
    return bitacoras

@api_router.post("/bitacoras")
async def create_bitacora(request: BitacoraCreate, background_tasks: BackgroundTasks, current_user: Dict = Depends(get_current_user)):
    bitacora_data = request.model_dump()
    if not bitacora_data.get("fecha"):
        bitacora_data["fecha"] = datetime.utcnow()
    
    bitacora = Bitacora(**bitacora_data)
    result = await db.bitacoras.insert_one(bitacora.model_dump(by_alias=True, exclude={"id"}))
    
    equipo = await db.equipos.find_one({"_id": ObjectId(request.equipo_id)})
    empresa = await db.empresas.find_one({"_id": ObjectId(request.empresa_id)})
    tecnico = await db.usuarios.find_one({"_id": ObjectId(request.tecnico_id)})
    
    if empresa and equipo and tecnico:
        background_tasks.add_task(
            email_service.send_maintenance_notification,
            empresa.get("email"),
            equipo.get("nombre"),
            bitacora_data["fecha"].strftime("%d/%m/%Y %H:%M"),
            tecnico.get("nombre")
        )
    
    return {"id": str(result.inserted_id)}

@api_router.put("/bitacoras/{bitacora_id}")
async def update_bitacora(bitacora_id: str, data: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    data.pop("_id", None)
    
    result = await db.bitacoras.update_one(
        {"_id": ObjectId(bitacora_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bitácora no encontrada")
    
    return {"message": "Bitácora actualizada"}

@api_router.delete("/bitacoras/{bitacora_id}")
async def delete_bitacora(bitacora_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.bitacoras.delete_one({"_id": ObjectId(bitacora_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bitácora no encontrada")
    return {"message": "Bitácora eliminada"}

@api_router.get("/servicios")
async def get_servicios(empresa_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if empresa_id:
        query["empresa_id"] = empresa_id
    
    servicios = []
    async for servicio in db.servicios.find(query):
        servicio["_id"] = str(servicio["_id"])
        servicio.pop("credenciales_encrypted", None)
        servicios.append(servicio)
    return servicios

@api_router.get("/servicios/{servicio_id}")
async def get_servicio(servicio_id: str, show_credentials: bool = False, current_user: Dict = Depends(get_current_user)):
    servicio = await db.servicios.find_one({"_id": ObjectId(servicio_id)})
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    servicio["_id"] = str(servicio["_id"])
    
    if show_credentials and current_user.get("rol") in ["administrador", "tecnico"]:
        if servicio.get("credenciales_encrypted"):
            try:
                servicio["credenciales"] = decrypt_password(servicio["credenciales_encrypted"])
            except:
                servicio["credenciales"] = "Error al descifrar"
    
    servicio.pop("credenciales_encrypted", None)
    
    return servicio

@api_router.post("/servicios")
async def create_servicio(request: ServicioCreate, current_user: Dict = Depends(get_current_user)):
    servicio_data = request.model_dump()
    
    if request.credenciales:
        servicio_data["credenciales_encrypted"] = encrypt_password(request.credenciales)
        servicio_data.pop("credenciales")
    
    servicio = Servicio(**servicio_data)
    result = await db.servicios.insert_one(servicio.model_dump(by_alias=True, exclude={"id"}))
    return {"id": str(result.inserted_id)}

@api_router.put("/servicios/{servicio_id}")
async def update_servicio(servicio_id: str, data: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    data.pop("_id", None)
    
    if "credenciales" in data and data["credenciales"]:
        data["credenciales_encrypted"] = encrypt_password(data.pop("credenciales"))
    
    result = await db.servicios.update_one(
        {"_id": ObjectId(servicio_id)},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    return {"message": "Servicio actualizado"}

@api_router.delete("/servicios/{servicio_id}")
async def delete_servicio(servicio_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.servicios.delete_one({"_id": ObjectId(servicio_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"message": "Servicio eliminado"}

@api_router.get("/reportes/empresa/{empresa_id}")
async def generate_empresa_report(empresa_id: str, background_tasks: BackgroundTasks, current_user: Dict = Depends(get_current_user)):
    empresa = await db.empresas.find_one({"_id": ObjectId(empresa_id)})
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    empresa["_id"] = str(empresa["_id"])
    
    equipos = []
    async for equipo in db.equipos.find({"empresa_id": empresa_id}):
        equipo["_id"] = str(equipo["_id"])
        equipos.append(equipo)
    
    bitacoras = []
    async for bitacora in db.bitacoras.find({"empresa_id": empresa_id}):
        bitacora["_id"] = str(bitacora["_id"])
        if isinstance(bitacora.get("fecha"), datetime):
            bitacora["fecha"] = bitacora["fecha"].isoformat()
        bitacoras.append(bitacora)
    
    servicios = []
    async for servicio in db.servicios.find({"empresa_id": empresa_id}):
        servicio["_id"] = str(servicio["_id"])
        if isinstance(servicio.get("fecha_renovacion"), datetime):
            servicio["fecha_renovacion"] = servicio["fecha_renovacion"].isoformat()
        servicios.append(servicio)
    
    try:
        # Obtener configuración para logo y nombre
        config = await db.configuracion.find_one({})
        logo_path = None
        sistema_nombre = "Sistema ITSM"
        
        if config:
            sistema_nombre = config.get("nombre_sistema", "Sistema ITSM")
            # Si hay logo en base64, guardarlo temporalmente
            if config.get("logo_url") and config["logo_url"].startswith("data:image"):
                import base64
                logo_data = config["logo_url"].split(",")[1]
                logo_bytes = base64.b64decode(logo_data)
                logo_path = "/tmp/logo_temp.png"
                with open(logo_path, "wb") as f:
                    f.write(logo_bytes)
        
        filename = pdf_service.generate_empresa_report(empresa, equipos, bitacoras, servicios, logo_path, sistema_nombre)
        
        background_tasks.add_task(
            email_service.send_report_notification,
            empresa.get("email"),
            empresa.get("nombre"),
            "Reporte de Empresa"
        )
        
        return {"filename": filename, "message": "Reporte generado exitosamente"}
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al generar reporte: {str(e)}")

@api_router.get("/reportes/equipo/{equipo_id}")
async def generate_equipo_report(equipo_id: str, current_user: Dict = Depends(get_current_user)):
    equipo = await db.equipos.find_one({"_id": ObjectId(equipo_id)})
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    
    equipo["_id"] = str(equipo["_id"])
    
    bitacoras = []
    async for bitacora in db.bitacoras.find({"equipo_id": equipo_id}):
        bitacora["_id"] = str(bitacora["_id"])
        if isinstance(bitacora.get("fecha"), datetime):
            bitacora["fecha"] = bitacora["fecha"].isoformat()
        bitacoras.append(bitacora)
    
    try:
        # Obtener configuración para logo y nombre
        config = await db.configuracion.find_one({})
        logo_path = None
        sistema_nombre = "Sistema ITSM"
        
        if config:
            sistema_nombre = config.get("nombre_sistema", "Sistema ITSM")
            if config.get("logo_url") and config["logo_url"].startswith("data:image"):
                import base64
                logo_data = config["logo_url"].split(",")[1]
                logo_bytes = base64.b64decode(logo_data)
                logo_path = "/tmp/logo_temp.png"
                with open(logo_path, "wb") as f:
                    f.write(logo_bytes)
        
        filename = pdf_service.generate_equipo_report(equipo, bitacoras, logo_path, sistema_nombre)
        return {"filename": filename, "message": "Reporte generado exitosamente"}
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al generar reporte: {str(e)}")

@api_router.get("/reportes/download/{filename}")
async def download_report(filename: str):
    filepath = os.path.join("/app/backend/pdfs", filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    return FileResponse(filepath, media_type="application/pdf", filename=filename)

@api_router.get("/bitacoras/exportar")
async def exportar_bitacoras(
    empresa_id: str,
    periodo: str,
    fecha_inicio: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    import csv
    from io import StringIO
    from datetime import timedelta
    
    # Calcular rango de fechas según período
    fecha_fin = datetime.utcnow()
    if periodo == "dia":
        fecha_inicio_dt = fecha_fin - timedelta(days=1)
    elif periodo == "semana":
        fecha_inicio_dt = fecha_fin - timedelta(weeks=1)
    elif periodo == "mes":
        fecha_inicio_dt = fecha_fin - timedelta(days=30)
    else:
        if fecha_inicio:
            fecha_inicio_dt = datetime.fromisoformat(fecha_inicio)
        else:
            fecha_inicio_dt = datetime.utcnow() - timedelta(days=30)
    
    # Consultar bitácoras
    query = {
        "empresa_id": empresa_id,
        "fecha": {"$gte": fecha_inicio_dt, "$lte": fecha_fin}
    }
    
    bitacoras = []
    async for bitacora in db.bitacoras.find(query).sort("fecha", -1):
        equipo = await db.equipos.find_one({"_id": ObjectId(bitacora["equipo_id"])})
        tecnico = await db.usuarios.find_one({"_id": ObjectId(bitacora["tecnico_id"])})
        
        bitacoras.append({
            "fecha": bitacora["fecha"].strftime("%d/%m/%Y %H:%M"),
            "equipo": equipo.get("nombre") if equipo else "N/A",
            "tipo": bitacora["tipo"],
            "descripcion": bitacora["descripcion"],
            "tecnico": tecnico.get("nombre") if tecnico else "N/A",
            "estado": bitacora["estado"],
            "observaciones": bitacora.get("observaciones", ""),
            "anotaciones_extras": bitacora.get("anotaciones_extras", "")
        })
    
    # Crear CSV
    output = StringIO()
    if bitacoras:
        writer = csv.DictWriter(output, fieldnames=bitacoras[0].keys())
        writer.writeheader()
        writer.writerows(bitacoras)
    
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=bitacoras_{empresa_id}_{periodo}.csv"}
    )

@api_router.get("/configuracion")
async def get_configuracion(current_user: Dict = Depends(get_current_user)):
    config = await db.configuracion.find_one({})
    if not config:
        config = Configuracion().model_dump(by_alias=True)
        await db.configuracion.insert_one(config)
    
    config["_id"] = str(config["_id"])
    return config

@api_router.put("/configuracion")
async def update_configuracion(request: ConfiguracionUpdate, current_user: Dict = Depends(get_admin_user)):
    update_data = request.model_dump(exclude_unset=True)
    update_data["actualizado_en"] = datetime.utcnow()
    
    result = await db.configuracion.update_one(
        {},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Configuración actualizada"}

@api_router.post("/configuracion/logo")
async def upload_logo(file: bytes = Body(...), current_user: Dict = Depends(get_admin_user)):
    from fastapi import UploadFile, File
    import base64
    
    # Guardar como base64 en la configuración
    logo_base64 = base64.b64encode(file).decode('utf-8')
    
    await db.configuracion.update_one(
        {},
        {"$set": {"logo_url": f"data:image/png;base64,{logo_base64}", "actualizado_en": datetime.utcnow()}},
        upsert=True
    )
    
    return {"message": "Logo actualizado exitosamente", "logo_url": f"data:image/png;base64,{logo_base64}"}

@api_router.get("/estadisticas")
async def get_estadisticas(current_user: Dict = Depends(get_current_user)):
    total_empresas = await db.empresas.count_documents({})
    total_equipos = await db.equipos.count_documents({})
    equipos_activos = await db.equipos.count_documents({"estado": "Activo"})
    total_bitacoras = await db.bitacoras.count_documents({})
    bitacoras_pendientes = await db.bitacoras.count_documents({"estado": "Pendiente"})
    total_servicios = await db.servicios.count_documents({"activo": True})
    
    servicios_cursor = db.servicios.find({"activo": True})
    costo_total_servicios = 0
    async for servicio in servicios_cursor:
        costo_total_servicios += servicio.get("costo_mensual", 0)
    
    return {
        "total_empresas": total_empresas,
        "total_equipos": total_equipos,
        "equipos_activos": equipos_activos,
        "total_bitacoras": total_bitacoras,
        "bitacoras_pendientes": bitacoras_pendientes,
        "total_servicios": total_servicios,
        "costo_total_servicios": costo_total_servicios
    }

@api_router.get("/")
async def root():
    return {"message": "Sistema ITSM API"}

app.include_router(api_router)

@app.on_event("startup")
async def startup():
    await init_db()
    
    admin_exists = await db.usuarios.find_one({"rol": "administrador"})
    if not admin_exists:
        admin = Usuario(
            email="admin@itsm.com",
            nombre="Administrador",
            password_hash=get_password_hash("admin123"),
            rol="administrador"
        )
        await db.usuarios.insert_one(admin.model_dump(by_alias=True, exclude={"id"}))
        logger.info("Usuario administrador creado: admin@itsm.com / admin123")
    
    config_exists = await db.configuracion.find_one({})
    if not config_exists:
        config = Configuracion()
        await db.configuracion.insert_one(config.model_dump(by_alias=True, exclude={"id"}))
        logger.info("Configuración inicial creada")

@app.on_event("shutdown")
async def shutdown():
    pass
