# Actualización automática del perfil

El README se mantiene al día solo en una sección: **Recent Activity**. El resto del contenido es estático, y las tarjetas de estadísticas se generan solas en los servicios externos cada vez que alguien visita el perfil.

## Cómo funciona

- El workflow `.github/workflows/update-readme.yml` se ejecuta cada 12 horas. También se ejecuta al cambiar el script o el propio workflow en `main`, y a mano desde la pestaña **Actions**.
- El workflow ejecuta `.github/scripts/recent-activity.mjs`. El script lee tu actividad pública desde la API de eventos de GitHub y reescribe el bloque entre `<!--RECENT_ACTIVITY:start-->` y `<!--RECENT_ACTIVITY:end-->`.
- Solo se hace commit cuando la actividad cambió, así que el historial no se llena de commits automáticos.

## Qué muestra

- Pushes, agrupando en una sola línea los pushes seguidos al mismo repositorio.
- Pull requests abiertos o fusionados, y revisiones de pull requests.
- Issues abiertos o cerrados.
- Repositorios creados o publicados, releases, forks y estrellas.

La actividad del propio repositorio del perfil se ignora. Los comentarios tampoco se muestran.

## Por qué no se usa una acción de terceros

En 2025 GitHub recortó los datos que devuelve la API de eventos. Los pushes ya no traen el número de commits y los pull requests ya no traen su URL. La acción anterior mostraba "undefined" por eso. El script construye los enlaces a partir del nombre del repositorio y del número del PR o issue, y omite cualquier dato que falte.

## Probarlo en local

```bash
node .github/scripts/recent-activity.mjs
```

Necesita Node.js 18 o superior y no tiene dependencias. Variables opcionales:

| Variable | Uso |
| --- | --- |
| `GITHUB_TOKEN` | Token para tener un límite de peticiones más alto |
| `MAX_ITEMS` | Número de líneas a mostrar, 5 por defecto |
| `README_PATH` | Archivo a actualizar, `README.md` por defecto |
| `EVENTS_FILE` | Lee los eventos de un JSON local en vez de la API |

## Permisos

El workflow declara `permissions: contents: write`. No hace falta cambiar los ajustes del repositorio ni crear secretos.

## Si deja de actualizarse

GitHub desactiva los workflows programados de un repositorio público tras 60 días sin actividad en ese repositorio. Si ocurre, entra en **Actions**, elige **Update README** y pulsa **Enable workflow**.
