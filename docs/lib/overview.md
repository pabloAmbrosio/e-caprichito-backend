# Lib — Overview

## Patrón: Facade

La carpeta `src/lib/` implementa el patrón **Facade**. Cada archivo expone una interfaz simplificada sobre una dependencia externa o una configuración compleja. Los módulos de la app consumen estas fachadas sin conocer los detalles internos.

| Archivo | Qué simplifica |
|---------|----------------|
| `prisma.ts` | Pool de conexión, adapter PG, extensiones de soft-delete |
| `redis.ts` | Lógica de conexión (URL vs host/port/password) |
| `roles.ts` | Origen de los enums (Prisma generated) + agrupaciones por tipo |
| `bcrypt.ts` | Hashing de contraseñas |
| `messaging/` | Strategy pattern — qué provider se usa (Twilio, log, etc.) |

## Facade vs Wrapper

- **Wrapper:** envuelve una llamada 1:1 sin agregar valor.
- **Facade:** simplifica y unifica el acceso a subsistemas complejos. Los consumidores no saben (ni les importa) qué hay detrás.

Lo que hay en `lib/` es fachada, no wrapper.
