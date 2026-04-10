# Config — Variables de Entorno

Se centralizaron todas las variables de entorno en un estilo singleton. Se validan con Valibot al arranque de la app y se exportan desde `src/config/env.ts`. Ningún módulo debe tomar variables directo de `process.env` — siempre importar `env` desde config.

## dotenv/config

`dotenv/config` se importa **únicamente** en `src/app.ts` (entry point). Es un side-effect de bootstrap y debe vivir ahí para que `process.env` esté poblado antes de que cualquier módulo se importe.

### Imports duplicados de dotenv/config — eliminados

Se eliminaron los `import 'dotenv/config'` redundantes de:

- ~~`src/lib/prisma.ts`~~ ✔
- ~~`src/modules/upload/upload.config.ts`~~ ✔

El único import de `dotenv/config` en todo el proyecto está en `src/app.ts`.

## Validación condicional por ambiente (producción)

El schema (`src/config/env.schema.ts`) usa `v.forward` + `v.check` para exigir variables adicionales cuando `NODE_ENV === 'production'`. Si faltan, el servidor **no arranca** y muestra un error descriptivo.

### Variables obligatorias solo en producción

| Variable | Motivo |
|----------|--------|
| `GOOGLE_CLIENT_ID` | OAuth con Google no funciona sin credenciales reales |
| `GOOGLE_CLIENT_SECRET` | OAuth con Google no funciona sin credenciales reales |
| `BASE_URL` | El callback de OAuth y cualquier URL absoluta del backend necesitan el dominio real (en dev se usa `localhost:${PORT}`) |

### Variables siempre obligatorias (cualquier ambiente)

| Variable | Motivo |
|----------|--------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Firma de tokens JWT |
| `COOKIE_SECRET` | Firma de cookies |
| `FRONTEND_URL` | CORS, redirect seguro de OAuth, Socket.IO |

### Patrón

```typescript
v.forward(
  v.check(
    ({ NODE_ENV, BASE_URL }) => NODE_ENV !== 'production' || !!BASE_URL,
    'BASE_URL es obligatorio en producción'
  ),
  ['BASE_URL']
),
```

La variable se declara como `v.optional(v.string())` en el schema base, y el `v.check` la hace obligatoria condicionalmente. Esto permite que en dev/test el fallback funcione sin configuración extra.
