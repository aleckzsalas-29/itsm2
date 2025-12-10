# 📦 Actualizar desde GitHub - Ver Historial

## 🎯 Resumen
Esta guía te muestra cómo aplicar los cambios de la funcionalidad "Ver Historial" en tu servidor de producción usando Git/GitHub.

---

## 📋 PASO 1: Guardar cambios en GitHub (Ya hecho aquí)

Los cambios ya están en este entorno. Para subirlos a GitHub:

```bash
# En el entorno Emergent (ya ejecutado)
cd /app
git add frontend/src/pages/Equipos.jsx
git commit -m "feat: Agregar funcionalidad Ver Historial en Equipos"
git push origin main
```

**Nota:** Si usas una rama diferente a `main`, reemplázala con tu nombre de rama.

---

## 📥 PASO 2: En tu servidor de producción

### A. Verificar estado actual y crear backup

```bash
# Conectar a tu servidor
ssh usuario@108.181.199.108

# Ir al directorio del proyecto
cd /opt/itsm

# Crear backup del archivo actual (IMPORTANTE)
cp frontend/src/pages/Equipos.jsx frontend/src/pages/Equipos.jsx.backup_$(date +%Y%m%d_%H%M%S)
```

### B. Verificar repositorio Git

```bash
# Ver el estado de git
git status

# Ver qué rama estás usando
git branch

# Ver el remoto configurado
git remote -v
```

### C. Guardar cambios locales (si los hay)

Si tienes cambios locales que no quieres perder:

```bash
# Opción 1: Guardar temporalmente (stash)
git stash save "Cambios locales antes de actualizar"

# Opción 2: Commit de tus cambios locales
git add .
git commit -m "Cambios locales en producción"
```

### D. Actualizar desde GitHub

```bash
# Obtener los últimos cambios
git fetch origin

# Aplicar los cambios (elige UNA de estas opciones)

# Opción A - Si no tienes cambios locales (RECOMENDADO):
git pull origin main

# Opción B - Si hiciste stash:
git pull origin main
git stash pop  # Restaura tus cambios locales

# Opción C - Si quieres sobreescribir cambios locales:
git fetch origin
git reset --hard origin/main
```

### E. Reiniciar el frontend

```bash
# Reiniciar con PM2
pm2 restart frontend

# Esperar unos segundos y verificar que compiló bien
pm2 logs frontend --lines 30
```

Debes ver: `webpack compiled successfully`

---

## 🔍 PASO 3: Verificar en el navegador

1. Abre: http://108.181.199.108:3000/equipos
2. Deberías ver el botón azul con ícono de historial en cada equipo
3. Haz clic para probar que el modal se abre correctamente

---

## ⚠️ Solución de Problemas

### Error: "Your local changes would be overwritten"

Significa que tienes cambios locales. Solución:

```bash
# Ver qué cambió
git diff

# Si quieres MANTENER tus cambios locales:
git stash
git pull origin main
git stash pop

# Si quieres DESCARTAR tus cambios locales:
git reset --hard HEAD
git pull origin main
```

### Error: "fatal: not a git repository"

El directorio no está conectado a git. Solución manual:

```bash
# Descargar el archivo directamente
cd /opt/itsm/frontend/src/pages
wget https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/frontend/src/pages/Equipos.jsx -O Equipos.jsx.new

# Revisar que se descargó bien
head -20 Equipos.jsx.new

# Hacer backup y reemplazar
cp Equipos.jsx Equipos.jsx.backup
mv Equipos.jsx.new Equipos.jsx

# Reiniciar
cd /opt/itsm
pm2 restart frontend
```

### El frontend no reinicia o da error

```bash
# Ver logs completos
pm2 logs frontend --lines 50

# Si hay errores de sintaxis, restaurar backup:
cd /opt/itsm
cp frontend/src/pages/Equipos.jsx.backup_* frontend/src/pages/Equipos.jsx
pm2 restart frontend
```

### Conflictos de merge

Si Git te muestra conflictos:

```bash
# Ver archivos en conflicto
git status

# Opción 1 - Usar la versión del servidor (conservar tus cambios):
git checkout --theirs frontend/src/pages/Equipos.jsx
git add frontend/src/pages/Equipos.jsx
git commit -m "Resolver conflicto - mantener versión local"

# Opción 2 - Usar la versión de GitHub (nueva funcionalidad):
git checkout --ours frontend/src/pages/Equipos.jsx
git add frontend/src/pages/Equipos.jsx
git commit -m "Resolver conflicto - usar nueva funcionalidad"

# Opción 3 - Resolver manualmente:
nano frontend/src/pages/Equipos.jsx
# Editar y quitar las marcas de conflicto: <<<<<<<, =======, >>>>>>>
git add frontend/src/pages/Equipos.jsx
git commit -m "Resolver conflicto manualmente"
```

---

## 📝 Comandos Resumidos (Caso Común)

Para la mayoría de los casos, solo necesitas:

```bash
# En tu servidor
cd /opt/itsm
cp frontend/src/pages/Equipos.jsx frontend/src/pages/Equipos.jsx.backup
git pull origin main
pm2 restart frontend
pm2 logs frontend --lines 20
```

---

## 🔄 Si algo sale mal - ROLLBACK

Restaurar el backup:

```bash
cd /opt/itsm
cp frontend/src/pages/Equipos.jsx.backup_* frontend/src/pages/Equipos.jsx
pm2 restart frontend
```

O usar git para volver a la versión anterior:

```bash
git log --oneline -5  # Ver últimos commits
git checkout <commit-id-anterior> -- frontend/src/pages/Equipos.jsx
pm2 restart frontend
```

---

## ✅ Verificación Final

Después de aplicar los cambios, verifica:

✅ Frontend compiló sin errores: `pm2 logs frontend`
✅ Botón azul aparece en la tabla de equipos
✅ Modal se abre al hacer clic en el botón
✅ Se muestra el historial (o mensaje si no hay registros)

---

## 📞 Ayuda Adicional

Si necesitas ayuda específica con Git:
- Ver historial: `git log --oneline -10`
- Ver diferencias: `git diff HEAD~1 frontend/src/pages/Equipos.jsx`
- Ver rama actual: `git branch -a`
- Ver configuración: `git config --list`
