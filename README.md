# E-Caprichito — Backend

Backend del e-commerce de El Caprichito, un local que ya opera de forma presencial y que está dando el salto a venta online. No es un proyecto de ejemplo: va a producción, con clientes reales y plata real de por medio.

Lo hice solo, de cero, y lo uso también como el proyecto donde me doy el lujo de practicar arquitectura y patrones que no cabían en trabajos anteriores.

## Qué hace

Lo que uno esperaría de un e-commerce, pero con decisiones específicas que valía la pena pensar:

- **Auth** con JWT + refresh tokens en cookie + OAuth Google + OTP por SMS/WhatsApp
- **Catálogo** con producto abstracto → variantes (SKU, precio, stock e imágenes por variante)
- **Carrito** con motor de promociones y cupones evaluado sobre el carrito al momento
- **Checkout** con 3 tipos de entrega (pickup, domicilio con zonas por distancia, envío plano) y cálculo de fee por Haversine
- **Pagos** con múltiples métodos incluyendo pago contra entrega, con máquina de estados
- **Shipments** con timeline de eventos y notificaciones en tiempo real (Socket.IO)
- **Expiración de órdenes** con cron que libera stock y cancela pagos pendientes
- **Backoffice** paralelo con RBAC (OWNER, ADMIN, MANAGER, SELLER)
- **Búsqueda** de productos en SQL crudo (no Prisma) para performance

## Stack

- **Fastify 5** + TypeScript
- **Prisma 7** sobre PostgreSQL 16
- **Valibot** para validación (con un compiler custom para Fastify)
- **Vitest** para tests — co-located con el código que prueban
- **Redis** para sesiones, OTPs y cache
- **Socket.IO** para notificaciones realtime
- **Twilio** para SMS/WhatsApp (con modo log en dev)

## Arquitectura

Cada módulo sigue la misma estructura:

```
Routes → Handlers → Services → Helpers
```

Con división `shop/` vs `backoffice/` en cada capa cuando aplica, selects de Prisma centralizados por módulo, errores con chain of responsibility, y adapters cuando un módulo necesita hablar con otro.

La filosofía: pensar el módulo como un sistema pequeño con fronteras claras. Nada de services importando de otros services sin pasar por un adapter, nada de selects sueltos, nada de `any`.

Hay documentación detallada de cada módulo y de las decisiones que tomé en [`CLAUDE.md`](./CLAUDE.md).

## Correrlo local

Necesitas Docker, Node 20+ y yarn.

```bash
# 1. levantar Postgres + Redis
docker-compose up -d

# 2. instalar dependencias
yarn install

# 3. setup de la BD
cp .env.example .env          # y rellenar los valores
yarn db:push
yarn db:seed                  # datos demo

# 4. arrancar en dev
yarn dev
```

El servidor queda en `http://localhost:3000`. Health check en `/health`.

## Tests

```bash
yarn test          # watch
yarn test:run      # single run
```

Los tests viven al lado del código que prueban (`src/modulo/__tests__/*.test.ts`), no en una carpeta separada. El hook `pretest` hace push del schema a una BD de test aparte en el puerto 5433.

## Sobre el uso de IA

Uso Claude Code como parte de mi flujo — principalmente para acelerar la escritura repetitiva, explorar opciones de diseño y revisar código mío. Las decisiones de arquitectura, los tradeoffs y los patrones son míos; la IA es un acelerador, no un autor. Me pareció honesto mencionarlo.

## Estado

En desarrollo activo. Lo que está en `main` compila, los tests pasan y el flujo de checkout funciona end-to-end. Módulos con documentación completa en `CLAUDE.md`: cart, product, address, shipment, messaging.

---

Para dudas o comentarios, pueden abrir un issue o contactarme directamente.
