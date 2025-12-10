from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_db():
    await db.usuarios.create_index("email", unique=True)
    await db.equipos.create_index("empresa_id")
    await db.bitacoras.create_index("equipo_id")
    await db.bitacoras.create_index("empresa_id")
    await db.servicios.create_index("empresa_id")
    print("Database indexes created")