# GitHub Profile Auto-Update System

Este sistema automatiza la actualización diaria de las estadísticas de tu perfil de GitHub.

## 🚀 Características

- **Actualización automática diaria** a las 9:00 AM UTC
- **Cache busting** para forzar la actualización de estadísticas
- **Timestamp automático** de última actualización
- **Ejecución manual** disponible
- **Dependabot** configurado para mantener dependencias actualizadas

## 📁 Archivos Creados

### `.github/workflows/update-stats.yml`

Workflow principal que se ejecuta diariamente para:

- Actualizar parámetros de cache busting en URLs de estadísticas
- Agregar/actualizar timestamp de última actualización
- Hacer commit y push automático de los cambios

### `.github/dependabot.yml`

Configuración de Dependabot para:

- Actualizar dependencias npm diariamente
- Actualizar actions de GitHub
- Mantener el sistema actualizado automáticamente

### `package.json`

Archivo de configuración npm básico para el proyecto

### `update-stats.sh`

Script manual para probar la funcionalidad localmente

## 🔧 Configuración

### 1. Permisos de GitHub Actions

Asegúrate de que tu repositorio tenga los permisos necesarios:

1. Ve a **Settings** > **Actions** > **General**
2. En "Workflow permissions", selecciona **Read and write permissions**
3. Marca **Allow GitHub Actions to create and approve pull requests**

### 2. Tokens (Opcional)

El sistema usa `GITHUB_TOKEN` automáticamente. Si necesitas permisos adicionales:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Crea un nuevo secret llamado `GITHUB_TOKEN` con un Personal Access Token

## 🎯 Funcionamiento

### Automático

- El workflow se ejecuta **todos los días a las 9:00 AM UTC**
- Actualiza automáticamente las URLs de estadísticas con cache busting
- Agrega timestamp de última actualización
- Hace commit y push automático

### Manual

Puedes ejecutar el workflow manualmente:

1. Ve a **Actions** > **Update GitHub Profile Stats**
2. Haz clic en **Run workflow**

También puedes usar el script local:

```bash
chmod +x update-stats.sh
./update-stats.sh
```

## 📊 Estadísticas Actualizadas

El sistema actualiza automáticamente:

- ✅ GitHub Stats (commits, PRs, issues)
- ✅ Top Languages (con filtros optimizados)
- ✅ Streak Stats (racha de commits)
- ✅ Activity Graph (gráfico de contribuciones)
- ✅ Profile Views Counter

## 🔄 Dependabot

Dependabot está configurado para:

- Revisar dependencias npm diariamente
- Actualizar GitHub Actions automáticamente
- Crear PRs automáticos para actualizaciones
- Asignar PRs al propietario del repositorio

## 🛠️ Personalización

### Cambiar Horario

Edita el cron en `.github/workflows/update-stats.yml`:

```yaml
schedule:
  - cron: '0 9 * * *' # 9:00 AM UTC diariamente
```

### Cambiar Zona Horaria en Dependabot

Edita `timezone` en `.github/dependabot.yml`:

```yaml
timezone: 'America/Mexico_City'
```

### Modificar Filtros de Lenguajes

Los filtros actuales ocultan: `html,css,scss,less,sass,stylus`
Para cambiar, edita las URLs en `README.md`

## 📈 Monitoreo

Puedes monitorear el sistema:

1. **Actions tab** - Ver ejecuciones del workflow
2. **Pull requests** - Ver PRs de Dependabot
3. **README** - Ver timestamp de última actualización

## 🎉 Beneficios

- **Estadísticas siempre actualizadas** - No más stats desactualizados
- **Mantenimiento automático** - Dependabot mantiene todo actualizado
- **Flexibilidad** - Ejecución manual disponible
- **Transparencia** - Timestamp visible de última actualización
- **Profesionalidad** - Perfil siempre al día

¡Tu perfil de GitHub ahora se actualiza automáticamente todos los días! 🚀
