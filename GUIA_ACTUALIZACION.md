# 📚 Guía Completa de Actualización - Sistema ITSM

## 🎯 Propósito

Esta guía proporciona instrucciones detalladas para actualizar tu sistema ITSM en producción de forma segura, con backups automáticos y posibilidad de rollback.

---

## 📋 Tabla de Contenidos

1. [Preparación Pre-Actualización](#1-preparación-pre-actualización)
2. [Método Automático (Recomendado)](#2-método-automático-recomendado)
3. [Método Manual](#3-método-manual)
4. [Verificación Post-Actualización](#4-verificación-post-actualización)
5. [Rollback en Caso de Problemas](#5-rollback-en-caso-de-problemas)
6. [Solución de Problemas](#6-solución-de-problemas)

---

## 1. Preparación Pre-Actualización

### ✅ Checklist Pre-Actualización

Antes de actualizar, verifica:

- [ ] **Backup manual adicional** (opcional pero recomendado)
- [ ] **Acceso SSH** al servidor funcionando
- [ ] **Conexión a internet** disponible
- [ ] **Espacio en disco** suficiente (min 2GB libre)
- [ ] **Servicios corriendo** actualmente
- [ ] **No hay usuarios activos** (idealmente)
- [ ] **Horario de baja demanda** (madrugada o fin de semana)

### 📊 Verificar Estado Actual

```bash
# Conectar al servidor
ssh usuario@108.181.199.108

# Verificar servicios
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend

# Verificar espacio en disco
df -h /opt/itsm

# Verificar última actualización
cd /opt/itsm
git log -1
```

### 💾 Backup Manual (Opcional)

Si quieres un backup manual adicional:

```bash
# Crear directorio de backups
sudo mkdir -p /opt/itsm_backups

# Backup de código
sudo tar -czf /opt/itsm_backups/manual_backup_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  /opt/itsm

# Backup de base de datos
mongodump --db itsm_database --out /opt/itsm_backups/mongodb_manual_$(date +%Y%m%d)
```

---

## 2. Método Automático (Recomendado)

### 📥 Paso 1: Descargar Scripts

```bash
cd /opt/itsm

# Descargar script de actualización
curl -O https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/actualizar_itsm.sh

# Descargar script de rollback
curl -O https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/rollback_itsm.sh

# Dar permisos de ejecución
chmod +x actualizar_itsm.sh rollback_itsm.sh
```

**O si ya tienes los archivos localmente:**

```bash
# Copiar desde /app/ si estás en el entorno de desarrollo
sudo cp /app/actualizar_itsm.sh /opt/itsm/
sudo cp /app/rollback_itsm.sh /opt/itsm/
sudo chmod +x /opt/itsm/*.sh
```

### 🚀 Paso 2: Ejecutar Actualización

```bash
cd /opt/itsm
sudo bash actualizar_itsm.sh
```

**El script automáticamente:**
1. ✅ Verifica requisitos
2. ✅ Crea backup completo (código + BD)
3. ✅ Detiene servicios
4. ✅ Descarga cambios de GitHub
5. ✅ Actualiza dependencias
6. ✅ Instala fuentes DejaVu (para PDFs)
7. ✅ Reinicia servicios
8. ✅ Verifica que todo funcione
9. ✅ Genera log detallado

### 📺 Ejemplo de Salida Exitosa

```
╔═══════════════════════════════════════════╗
║   Sistema ITSM - Script de Actualización  ║
║              Versión 2.0                  ║
╚═══════════════════════════════════════════╝

═══════════════════════════════════════════
  1. VERIFICACIONES PREVIAS
═══════════════════════════════════════════

[2024-12-10 20:15:30] ✓ Ejecutando como root
[2024-12-10 20:15:31] ✓ Directorio ITSM encontrado
[2024-12-10 20:15:32] ✓ Servicio backend corriendo
[2024-12-10 20:15:32] ✓ Servicio frontend corriendo
[2024-12-10 20:15:33] ✓ Conexión a internet disponible
[2024-12-10 20:15:33] ✓ Repositorio Git válido

═══════════════════════════════════════════
  2. CREANDO BACKUP
═══════════════════════════════════════════

[2024-12-10 20:15:35] Creando backup en: /opt/itsm_backups/backup_20241210_201535
[2024-12-10 20:15:58] ✓ Backup creado exitosamente
[2024-12-10 20:16:10] ✓ Backup de MongoDB creado

═══════════════════════════════════════════
  3. DETENIENDO SERVICIOS
═══════════════════════════════════════════

[2024-12-10 20:16:12] Deteniendo servicios...
[2024-12-10 20:16:14] ✓ Servicios detenidos

═══════════════════════════════════════════
  4. ACTUALIZANDO CÓDIGO
═══════════════════════════════════════════

[2024-12-10 20:16:15] Rama actual: main
[2024-12-10 20:16:18] ✓ Cambios descargados
[2024-12-10 20:16:22] ✓ Código actualizado exitosamente

═══════════════════════════════════════════
  5. ACTUALIZANDO DEPENDENCIAS
═══════════════════════════════════════════

[2024-12-10 20:16:25] ✓ Dependencias de Python actualizadas
[2024-12-10 20:17:45] ✓ Dependencias de Node actualizadas
[2024-12-10 20:17:50] ✓ Fuentes DejaVu instaladas

═══════════════════════════════════════════
  6. REINICIANDO SERVICIOS
═══════════════════════════════════════════

[2024-12-10 20:17:55] Iniciando servicios...

═══════════════════════════════════════════
  7. VERIFICACIONES POST-ACTUALIZACIÓN
═══════════════════════════════════════════

[2024-12-10 20:18:05] ✓ Backend corriendo
[2024-12-10 20:18:05] ✓ Frontend corriendo
[2024-12-10 20:18:08] ✓ Backend sin errores críticos
[2024-12-10 20:18:10] ✓ Frontend sin errores críticos
[2024-12-10 20:18:12] ✓ Backend respondiendo correctamente
[2024-12-10 20:18:14] ✓ Frontend respondiendo correctamente

═══════════════════════════════════════════
  8. RESUMEN DE ACTUALIZACIÓN
═══════════════════════════════════════════

╔═══════════════════════════════════════════╗
║   ACTUALIZACIÓN COMPLETADA EXITOSAMENTE   ║
╚═══════════════════════════════════════════╝

📦 Backup creado en:
   /opt/itsm_backups/backup_20241210_201535

📝 Cambios aplicados:
   • ca5e7c3 feat: Agregar fecha de revisión en bitácoras
   • 679b2ee feat: Implementar campos dinámicos por tipo
   • ...

🔧 Servicios:
   • Backend: active
   • Frontend: active

🌐 URLs:
   • Frontend: http://108.181.199.108:3000
   • Backend:  http://108.181.199.108:8001/api

📋 Log completo guardado en: /var/log/itsm_actualizacion_20241210_201535.log

✅ Actualización finalizada: 2024-12-10 20:18:15
```

### ⏱️ Tiempo Estimado

- **Total:** 5-10 minutos
- Backup: 1-2 min
- Descarga: 30 seg
- Dependencias: 2-5 min
- Reinicio: 10 seg

---

## 3. Método Manual

Si prefieres actualizar manualmente o el script automático falla:

### Paso 1: Crear Backup

```bash
sudo mkdir -p /opt/itsm_backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup de código
sudo rsync -av --exclude 'node_modules' \
  /opt/itsm/ /opt/itsm_backups/backup_${TIMESTAMP}/

# Backup de BD
mongodump --db itsm_database \
  --out /opt/itsm_backups/backup_${TIMESTAMP}/mongodb_backup
```

### Paso 2: Detener Servicios

```bash
sudo systemctl stop itsm-frontend
sudo systemctl stop itsm-backend
```

### Paso 3: Actualizar Código

```bash
cd /opt/itsm

# Guardar cambios locales (si los hay)
git stash

# Descargar cambios
git fetch origin
git pull origin main
```

### Paso 4: Actualizar Dependencias

```bash
# Backend
cd /opt/itsm/backend
pip3 install -r requirements.txt

# Frontend
cd /opt/itsm/frontend
yarn install
```

### Paso 5: Instalar Fuentes (si no las tienes)

```bash
sudo apt-get update
sudo apt-get install -y fonts-dejavu fonts-dejavu-core
```

### Paso 6: Reiniciar Servicios

```bash
sudo systemctl start itsm-backend
sleep 3
sudo systemctl start itsm-frontend
```

---

## 4. Verificación Post-Actualización

### ✅ Checklist de Verificación

#### A. Servicios

```bash
# Verificar estado
sudo systemctl status itsm-backend
sudo systemctl status itsm-frontend

# Ver logs recientes
sudo journalctl -u itsm-backend -n 50 --no-pager
sudo journalctl -u itsm-frontend -n 50 --no-pager
```

**Esperado:**
- Estado: `active (running)`
- Sin errores críticos en logs

#### B. Conectividad

```bash
# Probar backend
curl http://localhost:8001/api

# Probar frontend
curl -I http://localhost:3000
```

**Esperado:**
- Backend: respuesta JSON
- Frontend: `200 OK`

#### C. Interfaz Web

Abre en el navegador: `http://108.181.199.108:3000`

**Verificar:**
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Menú lateral visible

#### D. Nuevas Funcionalidades

**1. Ver Historial de Equipos:**
- [ ] Ve a Equipos
- [ ] Click en botón azul de historial
- [ ] Modal se abre con bitácoras

**2. Reportes PDF Mejorados:**
- [ ] Ve a Reportes
- [ ] Selecciona un equipo
- [ ] Elige una plantilla (Moderna/Clásica/Minimalista)
- [ ] Genera PDF
- [ ] Verifica que contiene toda la información

**3. Campos Dinámicos:**
- [ ] Ve a Equipos
- [ ] Crea nuevo equipo
- [ ] Selecciona tipo (ej: Laptop)
- [ ] Verifica que aparecen campos específicos

**4. Fecha de Revisión:**
- [ ] Ve a Bitácoras
- [ ] Crea nueva bitácora
- [ ] Campo "Fecha de Revisión" visible
- [ ] Guarda y verifica columna en tabla

---

## 5. Rollback en Caso de Problemas

Si algo sale mal, puedes revertir al estado anterior:

### 🔙 Método Automático

```bash
cd /opt/itsm

# Listar backups disponibles
ls -lth /opt/itsm_backups/

# Ejecutar rollback (reemplaza con tu backup)
sudo bash rollback_itsm.sh backup_20241210_201535
```

**El script te pedirá confirmación:**
```
⚠️ ADVERTENCIA: Esta acción restaurará el sistema al estado del backup:
  /opt/itsm_backups/backup_20241210_201535

¿Estás seguro de continuar? (escribe 'SI' para confirmar): SI
```

### 🔙 Método Manual

```bash
# Detener servicios
sudo systemctl stop itsm-frontend
sudo systemctl stop itsm-backend

# Restaurar archivos (reemplaza BACKUP_NAME)
sudo rsync -av --delete \
  /opt/itsm_backups/BACKUP_NAME/ /opt/itsm/

# Restaurar BD (si existe)
mongorestore --db itsm_database --drop \
  /opt/itsm_backups/BACKUP_NAME/mongodb_backup/itsm_database

# Reinstalar dependencias
cd /opt/itsm/backend && pip3 install -r requirements.txt
cd /opt/itsm/frontend && yarn install

# Reiniciar servicios
sudo systemctl start itsm-backend
sudo systemctl start itsm-frontend
```

---

## 6. Solución de Problemas

### ❌ Problema: Servicios no inician

**Síntomas:**
```bash
sudo systemctl status itsm-backend
# Status: failed
```

**Solución:**
```bash
# Ver error específico
sudo journalctl -u itsm-backend -n 50 --no-pager

# Errores comunes:
# 1. Puerto ocupado
sudo lsof -i :8001
sudo kill -9 <PID>

# 2. Dependencias faltantes
cd /opt/itsm/backend
pip3 install -r requirements.txt

# 3. Permisos incorrectos
sudo chown -R root:root /opt/itsm
```

---

### ❌ Problema: Error en PDF (fuentes)

**Síntomas:**
```
Character "•" at index 8 is outside the range of characters
```

**Solución:**
```bash
# Instalar fuentes DejaVu
sudo apt-get update
sudo apt-get install -y fonts-dejavu fonts-dejavu-core

# Verificar instalación
ls /usr/share/fonts/truetype/dejavu/DejaVuSans*.ttf

# Reiniciar backend
sudo systemctl restart itsm-backend
```

---

### ❌ Problema: Frontend no compila

**Síntomas:**
```
webpack compiled with errors
```

**Solución:**
```bash
cd /opt/itsm/frontend

# Limpiar y reinstalar
rm -rf node_modules yarn.lock
yarn install

# Reiniciar
sudo systemctl restart itsm-frontend

# Ver logs
sudo journalctl -u itsm-frontend -f
```

---

### ❌ Problema: Conflictos Git

**Síntomas:**
```
error: Your local changes would be overwritten by merge
```

**Solución:**
```bash
cd /opt/itsm

# Ver cambios
git status
git diff

# Opción 1: Guardar cambios temporalmente
git stash
git pull origin main
git stash pop

# Opción 2: Descartar cambios locales
git reset --hard HEAD
git pull origin main
```

---

### ❌ Problema: Espacio en disco insuficiente

**Síntomas:**
```
No space left on device
```

**Solución:**
```bash
# Ver uso de disco
df -h

# Limpiar backups antiguos (conservar últimos 5)
cd /opt/itsm_backups
ls -t | tail -n +6 | xargs rm -rf

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d

# Limpiar cache de yarn/npm
cd /opt/itsm/frontend
yarn cache clean
```

---

## 📊 Mantenimiento Recomendado

### Limpieza de Backups

Los backups se acumulan. Limpia periódicamente:

```bash
# Ver backups (ordenados por fecha)
ls -lth /opt/itsm_backups/

# Eliminar backups antiguos (manual)
sudo rm -rf /opt/itsm_backups/backup_YYYYMMDD_HHMMSS

# Script de limpieza automática (mantener últimos 10)
cd /opt/itsm_backups && ls -t | tail -n +11 | xargs rm -rf
```

### Actualización de Dependencias

Cada 1-2 meses:

```bash
# Backend
cd /opt/itsm/backend
pip3 list --outdated

# Frontend
cd /opt/itsm/frontend
yarn outdated
```

### Monitoreo de Logs

```bash
# Ver logs en tiempo real
sudo journalctl -u itsm-backend -f
sudo journalctl -u itsm-frontend -f

# Buscar errores
sudo journalctl -u itsm-backend --since "1 hour ago" | grep -i error
```

---

## 📞 Soporte

Si encuentras problemas no documentados:

1. **Revisar logs:**
   ```bash
   sudo journalctl -u itsm-backend -n 100 --no-pager
   sudo journalctl -u itsm-frontend -n 100 --no-pager
   ```

2. **Ejecutar diagnóstico:**
   ```bash
   cd /opt/itsm
   ./diagnostico_itsm.sh  # Si existe
   ```

3. **Contactar soporte** con:
   - Versión actual (`git log -1`)
   - Logs de error
   - Pasos reproducibles

---

## 📝 Resumen de Comandos Rápidos

```bash
# ACTUALIZACIÓN RÁPIDA
cd /opt/itsm
sudo bash actualizar_itsm.sh

# ROLLBACK RÁPIDO
sudo bash rollback_itsm.sh backup_YYYYMMDD_HHMMSS

# VERIFICACIÓN RÁPIDA
sudo systemctl status itsm-backend itsm-frontend
curl http://localhost:8001/api
curl -I http://localhost:3000

# LOGS RÁPIDOS
sudo journalctl -u itsm-backend -n 50 --no-pager
sudo journalctl -u itsm-frontend -n 50 --no-pager
```

---

**Versión:** 2.0  
**Fecha:** Diciembre 2024  
**Última Actualización:** Incluye todas las mejoras implementadas
