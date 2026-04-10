# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# E-Caprichito Backend — Fuente de Verdad

> Este archivo es la referencia principal de Claude sobre cómo trabaja este proyecto.
> Se actualiza incrementalmente cada vez que se toca un módulo nuevo.

## Reglas Generales

- **Siempre dirigirse al usuario como "jefazo".**
- Cada vez que se modifica un módulo, registrar aquí las decisiones que se tomaron y por qué.
- No analizar módulos de forma masiva — se documenta gradualmente, módulo por módulo, conforme se trabaja.
- Este archivo es la fuente de la verdad. Si hay conflicto entre este archivo y suposiciones, este archivo gana.
- **`docs/`** contiene documentación técnica detallada del proyecto (config, plugins, lib, schema). Es documentación personal orientada a portfolio/recruiters. Cuando se modifique funcionalidad relevante, actualizar también el doc correspondiente en `docs/`.

---

## Development Commands

```bash
# Dev server (hot-reload via ts-node-dev)
yarn dev

# Build & run production
yarn build && yarn start

# Tests (Vitest) — co-located con el código fuente
yarn test              # watch mode
yarn test:run          # single run (CI)
# Both auto-push schema to test DB (port 5433) via pretest hook

# IMPORTANTE: Los tests viven junto al código que prueban, NO en una carpeta tests/ separada.
# Patrón: src/modulo/__tests__/archivo.test.ts
# Configurado en vitest.config.ts → include: ['src/**/*.test.ts']
# NUNCA crear tests fuera de src/.

# Database (Prisma + PostgreSQL)
yarn db:generate       # generate Prisma Client from schema
yarn db:push           # push schema to dev DB (no migration file)
yarn db:migrate        # create + apply migration
yarn db:studio         # GUI browser for DB
yarn db:seed           # seed demo data
yarn db:reset          # force reset DB + re-seed

# Docker (PostgreSQL 16 on 5432, test DB on 5433, Redis 7 on 6379)
docker-compose up -d
```

### Key Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `COOKIE_SECRET` — Auth secrets
- `FRONTEND_URL` — CORS origin (default `http://localhost:5173`)
- `REDIS_URL` — Redis connection (sessions, cache)
- `SMS_MODE` — `"log"` (dev, default), `"twilio"` (prod: SMS + WhatsApp), `"whatsapp"` (solo WhatsApp + log SMS)
- `SEED_BASE_URL` — Base URL for seed image paths (default `http://localhost:3000`)

---

## Stack

- **Runtime:** Fastify 5 + TypeScript (ES2022, CommonJS)
- **ORM:** Prisma 7 (PostgreSQL 16)
- **Validación:** Valibot con `customValibotCompiler` (en `src/modules/server/index.ts`)
- **Testing:** Vitest
- **Realtime:** Socket.IO 4 (JWT auth, rooms: `user:{id}`, `staff`)
- **Cache:** Redis 7 (ioredis)
- **Mensajería:** Strategy Pattern en `src/lib/messaging/` (SMS, WhatsApp, Email — providers intercambiables)
- **Arquitectura por capas:** Routes → Handlers → Services → Helpers
- **Exports:** Barrel files (`index.ts`) en cada nivel de carpeta

---

## Server Bootstrap

Entry point: `src/app.ts` → validates env vars → checks DB → calls `buildServer()` from `src/modules/server/index.ts`.

`buildServer()` creates Fastify with custom Valibot compiler, registers plugins in order (CORS → Cookies → RateLimit → Auth → OAuth → Socket.IO → Static), then registers all module routes under `/api` prefix. Health check at `GET /health`.

---

## Authentication & Authorization

- **JWT plugin** (`src/plugins/auth.ts`): decorates Fastify with `authenticate`, `authenticateOptional`, `requirePhoneVerified` preHandlers
- **Guards plugin** (`src/plugins/guards.ts`): `requireRoles(['OWNER', 'ADMIN'])` factory for RBAC
- **Two role dimensions:** `AdminRole` (OWNER | ADMIN | MANAGER | SELLER | CUSTOMER) for permissions, `CustomerRole` (MEMBER | VIP_FAN | VIP_LOVER | VIP_LEGEND) for loyalty tier. Both in JWT payload.
- **Cookie auth** (`src/plugins/cookie-auth.ts`): `reply.setRefreshToken()`, `reply.clearRefreshToken()`, `reply.setTempAccessToken()`

---

## Prisma Client Extensions

`src/lib/prisma.ts` exports a singleton `db` extended with soft-delete auto-filter for `User` and `Address` models (`deletedAt` field). Types: `DbClient`, `TransactionClient`, `DbClientOrTx`.

---

## Arquitectura Global de Módulos

### Capas y Responsabilidades

| Capa | Responsabilidad | Qué NO hace |
|------|----------------|-------------|
| **Routes** | Definir endpoint HTTP, schema, preHandlers. Delegar al handler. | No tiene lógica de negocio. |
| **Handlers** | Extraer datos del request, llamar al service, manejar errores, devolver response. | No accede a DB directamente. |
| **Services** | Orquestar la operación. Combinar helpers y otros services. | No contiene lógica atómica reutilizable — eso va en helpers. |
| **Helpers** | Operaciones atómicas: mutaciones de DB, validaciones de negocio, transformaciones de datos. | No sabe del request/response HTTP. |
| **Schemas** | Validación de entrada con Valibot. Querystring con coerción, body sin coerción. | No contiene lógica de negocio. |
| **Selects** | Centralizar los `select` de Prisma para queries consistentes. | No se definen selects sueltos en services/helpers. |

### División Shop / Backoffice

El primer nivel de carpetas dentro de cada capa (routes, handlers, services) se divide en:

- **`shop/`** — Endpoints para el cliente final (requieren `app.authenticate`)
- **`backoffice/`** — Endpoints administrativos (requieren validación de rol)
- **`shared/`** — Lógica reutilizable entre shop y backoffice (solo en services)

### Subdivisión por Dominio

Dentro de `shop/` y `backoffice/`, si el módulo maneja múltiples dominios, se subdivide en carpetas por dominio. Ejemplo en cart:

```
shop/
  cart/        → operaciones sobre el carrito mismo
  items/       → agregar, actualizar, eliminar items
  coupon/      → aplicar y remover cupones
```

Esta estructura se replica en paralelo en routes, handlers, services, helpers y schemas.

---

## Patrones de Diseño

### 1. Selects Centralizados

Cada módulo tiene un archivo `{module}.selects.ts` en la raíz del módulo que define TODOS los selects de Prisma. Los services y helpers importan de ahí — nunca definen selects inline.

```typescript
// cart.selects.ts — variantes para distintos contextos
export const cartSelect = { ... }           // Base para shop
export const cartSummarySelect = { ... }    // Ligero para navbar
export const cartBackofficeSelect = { ... } // Con campos admin
export const abandonedCartSelect = { ... }  // Para carritos abandonados
```

### 2. Services como Orquestadores

Los services son funciones async que **orquestan** el flujo:
- Llaman a helpers para mutaciones y validaciones
- Llaman a otros services para obtener datos actualizados
- Retornan `{ message, data }` como estructura estándar

**No** contienen lógica atómica — si una operación es reutilizable, va en un helper.

### 3. Helpers como Lógica Atómica

Los helpers contienen:
- Mutaciones de DB (create, update, delete)
- Validaciones de negocio (stock, disponibilidad, límites)
- Transformaciones de datos (mapeos, cálculos)
- Funciones privadas internas que solo usa ese helper

Patrón típico: funciones privadas de validación + función pública exportada.

### 4. Tipos Derivados del Runtime

Los tipos principales del módulo se derivan de funciones reales, no se definen manualmente:

```typescript
// cart.types.ts
export type Cart = Awaited<ReturnType<typeof getOrCreateCart>>;
export type CartItem = Cart["items"][number];
```

Esto garantiza que los tipos siempre estén sincronizados con los selects de Prisma.

### 5. Adapters para Comunicación entre Módulos

Cuando un módulo necesita funcionalidad de otro módulo, usa un adapter:
- Define sus propios tipos (no importa types del otro módulo)
- Expone funciones wrapper que encapsulan la dependencia
- Aísla al módulo de cambios internos del módulo externo

### 6. Error Handling: Chain of Responsibility

Cada módulo tiene su propio sistema de errores:
- Clase base de error (`CartError`, etc.)
- Errores custom que extienden la base
- Dispatcher central (`handleCartError`) que prueba cada handler en secuencia
- El primer handler que matchea, responde

### 7. Coerción en Querystring Schemas

Los schemas usados como `querystring` DEBEN usar helpers de coerción de `src/modules/shared/schemas/coerce.ts`:
- `coerceInteger`, `coerceBoolean`, `coerceNumber`, `coerceStringArray`, `coerceSortArray`
- Usar `v.InferOutput` (no `v.InferInput`) cuando el schema tiene transforms

Los schemas de body (POST/PATCH) NO necesitan coerción — JSON parsing maneja los tipos.

### 8. Barrel Exports

Cada carpeta tiene un `index.ts` que re-exporta todo su contenido. Esto permite imports limpios:

### 9. Nunca castear `db` o `tx` a `any`

**PROHIBIDO** usar `(db as any)` o `(tx as any)` para acceder a modelos de Prisma. El cliente extendido (`db` de `src/lib/prisma.ts`) y el transaccional (`tx` dentro de `$transaction`) ya tipan correctamente todos los modelos. Si TypeScript marca un error al acceder a un modelo, el problema está en el tipo del parámetro — corregir el tipo, no castear a `any`.

```typescript
import { getActiveCartService } from "../services";
```

---

## Módulos Documentados

### Cart (`src/modules/cart/`)

**Última actualización:** 2026-02-24
**Decisiones registradas:** Documentación inicial

#### Estructura

```
cart/
├── cart.selects.ts          → 5 variantes de select centralizadas
├── cart.config.ts           → MAX_ITEMS_PER_CART, MAX_QUANTITY_PER_ITEM
├── constants.ts             → URLs de endpoints
├── types/                   → Cart y CartItem derivados del runtime
├── adapters/                → inventory.adapter.ts, promotion.adapter.ts
├── errors/                  → Chain of responsibility con 10+ custom errors
├── schemas/
│   ├── cart/                → list-carts (coerción), create, restore, etc.
│   ├── items/               → create-cart-item, update, delete
│   └── coupon/              → apply-coupon
├── routes/
│   ├── shop/{cart,items,coupon}/
│   └── backoffice/
├── handlers/
│   ├── shop/{cart,items,coupon}/
│   └── backoffice/
├── services/
│   ├── shop/{cart,items,coupon}/
│   ├── backoffice/
│   └── shared/              → build-cart-with-promotions, map-cart-to-customer
└── helpers/
    ├── cart/                → get-or-create (con manejo P2002), check-stock, etc.
    ├── items/               → handle-cart-item-addition (add/update/remove unificado)
    └── coupon/              → apply, remove, check coupon
```

#### Patrones Específicos del Cart

- **getOrCreateCart:** Upsert con retry ante race condition (Prisma P2002 unique constraint)
- **handleCartItemAddition:** Función unificada que decide si agregar, actualizar o eliminar según la cantidad resultante. Retorna `{ action: "added" | "updated" | "removed" }`
- **buildCartWithPromotions:** Servicio compartido que evalúa el motor de promociones sobre un carrito. Usado tanto por shop como backoffice.
- **Cart Summary vs Full Cart:** Dos selects distintos — `cartSummarySelect` (ligero, para navbar) y `cartSelect` (completo, con items y productos)
- **Backoffice filters:** Los services de backoffice construyen filtros WHERE internamente con funciones `buildSearchFilter`, `buildUserFilter`, etc. y ejecutan queries en paralelo con `Promise.all`

### Product (`src/modules/product/`)

**Última actualización:** 2026-02-24
**Decisiones registradas:** Documentación inicial + refactor imágenes a JSON estructurado

#### Estructura

```
product/
├── product.select.ts             → Selects centralizados (abstractProduct, variant, backoffice, etc.)
├── product-route-specs.ts        → Tipos de Fastify route specs
├── constants/                    → URLs de endpoints
├── types/                        → Tipos del módulo a nivel raíz
│   └── product-image.types.ts    → ProductImage: tipado oficial del JSON de imágenes
├── customer-search-engine/       → Motor de búsqueda con SQL puro
│   ├── builders/                 → Constructores SQL (WHERE, ORDER BY, aggregates, CTEs)
│   ├── helpers/                  → Paginación, validación de filtros
│   ├── types/                    → ImageJson (alias de ProductImage), filtros, response, SQL
│   └── execute-search.ts         → Punto de entrada del engine
├── errors/                       → Chain of responsibility con 12+ custom errors
│   ├── custom/                   → Errores específicos (not-found, duplicate, status, stock)
│   ├── prisma.error-handler.ts   → Handler dedicado para errores Prisma
│   └── handle-product.errors.ts  → Dispatcher central
├── schemas/
│   ├── product-image.schema.ts   → ProductImageInputSchema (Valibot, input sin thumbnailUrl)
│   ├── json-value.schema.ts      → JsonValueSchema recursivo (compatible con Prisma.InputJsonValue)
│   ├── create-abstract-product.schema.ts
│   ├── create-product.schema.ts  → (variantes)
│   ├── initialize-product.schema.ts → (abstract + variantes en una operación)
│   ├── update-product.schema.ts
│   ├── list-products.schema.ts   → (con coerción de querystring)
│   └── ...                       → add-variants, change-status, categories, likes
├── routes/
│   ├── shop/                     → list, detail, likes, categories
│   └── backoffice/               → CRUD completo, status management, variants
├── handlers/
│   ├── shop/                     → Thin handlers para lectura
│   └── backoffice/               → Thin handlers para mutaciones
├── services/
│   ├── shop/
│   │   ├── product/              → list-products (usa search engine), get-product-detail
│   │   ├── like/                 → add, remove, get liked products/ids
│   │   └── category/             → list-categories (árbol jerárquico)
│   ├── backoffice/
│   │   ├── product/              → initialize, update, delete, change-status, get-backoffice
│   │   ├── variant/              → add, create, delete, change-status
│   │   └── category/             → create, update, delete, get
│   ├── helpers/
│   │   ├── product/              → find-or-fail, status-transition, mappers, slug, breadcrumb
│   │   ├── like/                 → check, create, remove, find liked
│   │   ├── category/             → tree builder, find-or-fail, CRUD records
│   │   └── shared/               → generate-slug, handle-prisma-error
│   └── types/                    → Interfaces de response (ProductDetail, BackofficeProductDetail, etc.)
```

#### Patrones Específicos del Product

- **Customer Search Engine:** Motor de búsqueda dedicado con SQL puro (no Prisma ORM) para performance. Usa builders modulares para WHERE, ORDER BY, aggregates y CTEs de categorías jerárquicas. Vive en su propia carpeta `customer-search-engine/` con tipos, helpers y builders propios.

- **Modelo Abstract Product + Product (Variantes):** Un `AbstractProduct` agrupa metadata compartida (título, descripción, categoría, tags). Cada `Product` es una variante con su propio SKU, precio, detalles, stock e imágenes. La operación `initialize-product` crea ambos en una transacción. **AbstractProduct NO tiene campos de imagen** — las imágenes viven exclusivamente en las variantes.

- **Imágenes como JSON estructurado en Product:**
  - El campo `images` en Product (variante) es `Json?` y almacena `ProductImage[]`.
  - Shape: `{ imageUrl: string, thumbnailUrl: string, alt?: string, order?: number }`.
  - El front envía solo `imageUrl` por cada imagen. El backend deriva `thumbnailUrl = imageUrl` via el helper `deriveThumbnails`.
  - Cuando haya servicio de compresión, solo cambia `deriveThumbnails` — el front no se entera.
  - Schema Valibot de input: `ProductImageInputSchema` (sin thumbnailUrl).
  - Tipo TS completo: `ProductImage` en `types/product-image.types.ts`.

- **JSON Fields tipados:**
  - `details`: Validado con `JsonValueSchema` recursivo para compatibilidad con `Prisma.InputJsonValue`.
  - `seoMetadata`: Mismo patrón que details.

- **Mappers de salida:** `map-to-product-detail.ts` y `map-to-backoffice-detail.ts` transforman los datos crudos de Prisma a las interfaces de response del API. Las imágenes de variantes se castean como `ProductImage[] | null`. El abstract product no tiene campos de imagen en el response.

- **Subdivisión por dominio en services:** product, variant, category, like — cada uno en su carpeta bajo shop/ o backoffice/.

- **Helpers compartidos entre shop y backoffice:** Viven en `services/helpers/` (no en una carpeta `helpers/` a nivel raíz como en cart). Es una variación del patrón — los helpers son internos a la capa de services.

- **Status Machine:** Las variantes y abstract products tienen status con transiciones validadas por `validate-status-transition.ts`.

- **Category Tree:** Las categorías son jerárquicas. `build-category-tree.ts` construye el árbol y `build-category-breadcrumb.ts` genera el breadcrumb de raíz a hoja.

#### Estado de Imágenes

| Aspecto | Estado |
|---------|--------|
| **Modelo** | Solo `Product` tiene `images Json?`. `AbstractProduct` no tiene campos de imagen. |
| **Tipo TS** | `ProductImage { imageUrl, thumbnailUrl, alt?, order? }` en `types/product-image.types.ts` |
| **Schema Valibot input** | `ProductImageInputSchema { imageUrl, alt?, order? }` en `schemas/product-image.schema.ts` |
| **Schemas de creación** | Validan `ProductImageInput[]` (array de objetos sin thumbnailUrl) |
| **Helper derivación** | `deriveThumbnails` en `services/helpers/product/derive-thumbnails.ts` — agrega `thumbnailUrl = imageUrl` |
| **Types de response** | Variantes: `images: ProductImage[] \| null`. Abstract: sin images. |
| **Search engine** | `ImageJson` (alias de `ProductImage`). Solo en variantes del JSON_AGG. |
| **BD (Prisma)** | JSON column en Product. Sin columnas escalares de imagen. |

### Address (`src/modules/address/`)

**Última actualización:** 2026-02-25
**Decisiones registradas:** Módulo completo creado con migración de Delivery

#### Estructura

```
address/
├── address.selects.ts        → 2 selects: addressSelect (API), addressOwnershipSelect (interno)
├── constants.ts              → ADDRESS_URL, MAX_ADDRESSES_PER_USER (10)
├── adapters/                 → delivery.adapter.ts (verifica envíos activos)
├── errors/                   → Chain of responsibility con 5 custom errors
│   ├── custom/               → not-found (404), not-owned (403), limit (400), in-use (409), last-default (400)
│   ├── address.error-class.ts
│   ├── default.error.ts
│   └── handle-address.errors.ts
├── schemas/
│   ├── address-id.schema.ts          → Params: { addressId: uuid }
│   ├── create-address.schema.ts      → Body: label, formattedAddress, details?, lat, lng, isDefault?
│   ├── update-address.schema.ts      → Body: v.partial(CreateAddressSchema)
│   └── list-user-addresses.schema.ts → Querystring backoffice: { userId: uuid }
├── helpers/
│   ├── find-address-or-fail.ts       → findUnique + throw AddressNotFoundError
│   ├── assert-address-owner.ts       → userId match + throw AddressNotOwnedError
│   ├── assert-not-in-active-shipment.ts → usa shipment adapter + throw AddressInUseError
│   ├── assert-address-limit.ts       → count check + throw AddressLimitError
│   ├── ensure-single-default.ts      → updateMany isDefault=false en otras
│   └── reassign-default.ts           → findFirst newest + set isDefault=true
├── routes/
│   ├── shop/                 → GET, POST, PATCH /:addressId, DELETE /:addressId
│   └── backoffice/           → GET con querystring userId
├── handlers/
│   ├── shop/                 → list, create (201), update, delete
│   └── backoffice/           → list-user-addresses
└── services/
    ├── shop/                 → list, create (tx), update (tx), delete (tx)
    └── backoffice/           → list-user-addresses
```

#### Patrones Específicos del Address

- **Soft delete con auto-filter:** `deletedAt` field con auto-filter global en `$extends` de `src/lib/prisma.ts`. Los helpers que necesitan incluir borrados usan `deletedAt: null` explícitamente para bypasear la extensión.

- **Single default enforcement:** Al crear o actualizar con `isDefault: true`, `ensureSingleDefault` pone `isDefault: false` en todas las demás del usuario. Al borrar una dirección default, `reassignDefault` promueve la más reciente.

- **LastDefault protection:** No se permite quitar `isDefault` a la única dirección default. El service de update valida esto antes de ejecutar.

- **Shipment reference (no snapshot):** `Shipment.addressId` apunta directamente al `Address` del usuario (FK nullable). Los order selects incluyen la dirección via relación.

- **Adapter para cross-module:** `shipment.adapter.ts` encapsula la query a `Shipment` para verificar envíos activos. Los helpers no importan directamente del módulo shipment.

- **Transacciones en mutaciones:** Create, update y delete usan `db.$transaction` para garantizar consistencia en operaciones multi-paso (validaciones + mutación + default management).

#### Endpoints

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/addresses` | authenticate | Listar mis direcciones |
| POST | `/api/addresses` | authenticate | Crear dirección (auto-default si primera) |
| PATCH | `/api/addresses/:addressId` | authenticate | Actualizar dirección |
| DELETE | `/api/addresses/:addressId` | authenticate | Soft delete dirección |
| GET | `/api/backoffice/addresses?userId=` | OWNER, ADMIN | Listar direcciones de un usuario |

### Shipment (`src/modules/shipment/`)

**Última actualización:** 2026-02-25
**Decisiones registradas:** Módulo completo desde cero

#### Estructura

```
shipment/
├── shipment.config.ts           → STORE_LAT/LNG, DELIVERY_ZONES, fees
├── shipment.selects.ts          → 3 variantes: shipmentSelect, shipmentDetailSelect, shipmentEventSelect
├── constants.ts                 → URLs + VALID_SHIPMENT_TRANSITIONS (7 estados)
├── types/                       → Re-export de CreateShipmentInput
├── adapters/
│   └── order.adapter.ts         → createShipmentForOrder (Shipment + primer ShipmentEvent)
├── errors/                      → Chain of responsibility con 5 custom errors
│   ├── custom/                  → not-found, invalid-transition, carrier-required, address-required, delivery-not-available
│   └── handle-shipment.errors.ts
├── schemas/
│   ├── calculate-fee.schema.ts  → Body: { deliveryType, addressId? }
│   ├── shipment-id.schema.ts    → Params: { shipmentId: uuid }
│   ├── tracking-order-id.schema.ts → Params: { orderId: uuid }
│   ├── update-status.schema.ts  → Body: { status, note?, carrier?, trackingCode?, estimatedAt? }
│   ├── list-shipments.schema.ts → Querystring con coerción: page, limit, status?, type?, dateFrom?, dateTo?
│   └── create-shipment.schema.ts → Interface TS (no Valibot): CreateShipmentInput
├── helpers/
│   ├── haversine.ts             → Fórmula pura, retorna km
│   ├── calculate-delivery-fee.ts → Zonas + DeliveryFeeResult
│   ├── find-shipment-or-fail.ts → findUnique + throw ShipmentNotFoundError
│   ├── assert-valid-shipment-transition.ts → valida contra VALID_SHIPMENT_TRANSITIONS
│   └── assert-order-owner.ts    → compara customerId, throw ShipmentNotFoundError
├── notifications/
│   └── emit-shipment-update.ts  → Socket.IO: io.to(`user:${userId}`).emit("shipment:updated", payload)
├── routes/
│   ├── shop/                    → POST /calculate-fee, GET /:orderId/tracking
│   └── backoffice/              → GET /, GET /:shipmentId, PATCH /:shipmentId/status
├── handlers/
│   ├── shop/                    → calculate-fee, get-tracking
│   └── backoffice/              → list-shipments, get-shipment-detail, update-shipment-status
└── services/
    ├── shop/                    → calculate-fee, get-tracking
    └── backoffice/              → list-shipments, get-shipment-detail, update-shipment-status
```

#### Patrones Específicos del Shipment

- **Delivery Fee con Haversine:** `calculateDeliveryFee` usa la fórmula de Haversine para calcular distancia entre tienda y dirección. Zonas en `DELIVERY_ZONES`: 0-3km gratis, 3-8km $50, 8-15km $80. Fuera de rango sugiere SHIPPING a tarifa plana.

- **Estado machine con 7 estados:** PENDING → PREPARING → SHIPPED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED. FAILED es alcanzable desde cualquier estado activo. Solo FAILED → PENDING permite reintentar. Transiciones validadas con `assertValidShipmentTransition`.

- **Events timeline:** Cada cambio de estado crea un `ShipmentEvent` con status, note y timestamp. La timeline se ordena cronológicamente (asc) para tracking público.

- **Socket notifications:** `emitShipmentUpdate` es una función dedicada en `notifications/`. El handler la invoca después del service — el service retorna `{ msg, data, notification }` y el handler emite el evento.

- **Carrier validation:** Al pasar SHIPPING de PREPARING → SHIPPED, se requiere carrier y/o trackingCode. Lanza `CarrierRequiredError` si faltan.

- **3 tipos de entrega:** PICKUP (gratis, sin dirección), HOME_DELIVERY (con zonas y distancia), SHIPPING (tarifa plana, para distancias largas).

- **Order integration:** `POST /api/order` ahora requiere body `{ deliveryType, addressId? }`. El checkout calcula el fee, crea la orden, y luego crea el Shipment + primer event en la misma transacción.

#### Endpoints

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/shipments/calculate-fee` | authenticate | Calcular tarifa de envío |
| GET | `/api/shipments/:orderId/tracking` | authenticate | Tracking público del envío |
| GET | `/api/backoffice/shipments` | OWNER, ADMIN | Listar envíos con filtros y paginación |
| GET | `/api/backoffice/shipments/:shipmentId` | OWNER, ADMIN | Detalle completo del envío |
| PATCH | `/api/backoffice/shipments/:shipmentId/status` | OWNER, ADMIN | Actualizar estado + socket notification |

### Messaging (`src/lib/messaging/`)

**Última actualización:** 2026-03-01
**Decisiones registradas:** Strategy Pattern para desacoplar envío de mensajes

#### Estructura

```
lib/messaging/
├── index.ts                     → Barrel export (messaging singleton + types)
├── messaging.types.ts           → MessageChannel, MessageProvider, SendMessageOptions, SendResult
├── messaging.service.ts         → MessagingService: registry + delegation
├── messaging.init.ts            → Singleton inicializado según SMS_MODE env var
├── messaging.errors.ts          → UnsupportedChannelError
└── providers/
    ├── twilio.config.ts         → Singleton Twilio client + credenciales de env vars
    ├── twilio-sms.provider.ts   → SMS via Twilio API
    ├── twilio-whatsapp.provider.ts → WhatsApp via Twilio API (prefijo whatsapp:)
    ├── log.provider.ts          → Dev: console.log para SMS/WhatsApp (acepta channel param)
    └── log-email.provider.ts    → Stub email: log con soporte de subject y templates
```

#### Patrón: Strategy + Registry

El módulo implementa **Strategy Pattern** con un **Registry** central:

1. **Interface `MessageProvider`:** Define el contrato (`channel`, `name`, `send()`). Cada provider implementa esta interface.
2. **`MessagingService`:** Mantiene un `Map<MessageChannel, MessageProvider>`. Métodos: `register()`, `send()`, `hasProvider()`.
3. **`messaging.init.ts`:** Bootstrap singleton que registra providers según `SMS_MODE`:
   - `"twilio"` → TwilioSmsProvider + TwilioWhatsAppProvider
   - `"whatsapp"` → TwilioWhatsAppProvider + LogProvider('sms')
   - default/`"log"` → LogProvider('sms') + LogProvider('whatsapp')
   - Email: siempre `LogEmailProvider` (stub hasta integrar SendGrid/Mailgun)

#### Canales Soportados

| Canal | Provider Prod | Provider Dev | Notas |
|-------|--------------|-------------|-------|
| `sms` | `TwilioSmsProvider` | `LogProvider('sms')` | Usado en OTP, notificaciones staff |
| `whatsapp` | `TwilioWhatsAppProvider` | `LogProvider('whatsapp')` | Prefija `whatsapp:` al número |
| `email` | (pendiente) | `LogEmailProvider` | Stub con soporte de subject + templates |

#### Uso desde otros módulos

```typescript
import { messaging } from '../../lib/messaging';

// SMS
await messaging.send({ channel: 'sms', to: '+521234567890', message: 'Tu código es 123456' });

// WhatsApp
await messaging.send({ channel: 'whatsapp', to: '+521234567890', message: 'Pedido confirmado' });

// Email con template
await messaging.send({
  channel: 'email', to: 'user@example.com', subject: 'Bienvenido',
  message: 'Hola', template: { id: 'welcome', variables: { name: 'Juan' } },
});
```

#### Módulos que consumen messaging

- **Auth:** `register`, `forgot-password`, `add-phone`, `request-otp` — envían OTP vía SMS/email
- **Payments:** `notify-staff-sms` — notifica al staff cuando hay un pago nuevo

#### Decisiones de diseño

- **OTP desacoplado del envío:** Las funciones `createOTPRedis` y `createOTPForEmailRedis` ya no envían mensajes — solo generan el código y lo guardan en Redis. El caller recibe el código y es responsable de llamar `messaging.send()`.
- **Archivos legacy conservados:** `auth/services/sms.service.ts`, `email.service.ts` y `twilio.config.ts` (auth) ya no son importados por código activo. Se mantienen temporalmente por backward compat.
- **Extensibilidad:** Para agregar un nuevo provider (ej: SendGrid para email), solo se crea la clase que implemente `MessageProvider` y se registra en `messaging.init.ts`. Cero cambios en los módulos consumidores.

---

## Registro de Decisiones

| Fecha | Módulo | Decisión | Contexto |
|-------|--------|----------|----------|
| 2026-02-24 | Cart | Documentación inicial del módulo | Creación del CLAUDE.md, análisis completo de arquitectura |
| 2026-02-24 | Product | Documentación inicial del módulo | Análisis completo de arquitectura y patrones |
| 2026-02-24 | Product | Crear tipo `ProductImage` y schema `ProductImageSchema` sin migrar schemas existentes | El JSON de imágenes cambiará de `string[]` a `ProductImage[]`. Se prepara el tipado y el schema Valibot pero NO se toca la validación actual — la migración será en la siguiente fase. `ImageJson` del search engine ahora es alias de `ProductImage`. |
| 2026-02-24 | Product | Agregar `imageUrl` y `thumbnailUrl` como campos escalares en AbstractProduct y Product | Campos String? nullable. El front envía solo `imageUrl`, el backend deriva `thumbnailUrl = imageUrl`. Cuando haya servicio de compresión, solo cambia el backend. El campo JSON `images` se mantiene sin cambios. Se actualizaron: schema Prisma, 5 schemas Valibot, 5 services/helpers, 3 selects base + 3 de orders, 4 types, 3 mappers, SQL del search engine, y seed demo. |
| 2026-02-24 | Product | Refactor: eliminar escalares `imageUrl`/`thumbnailUrl`, mover imágenes a JSON estructurado solo en Product | AbstractProduct pierde TODO campo de imagen (images, imageUrl, thumbnailUrl). Product pierde escalares imageUrl/thumbnailUrl. El campo JSON `images` en Product cambia de `string[]` a `ProductImage[] { imageUrl, thumbnailUrl, alt?, order? }`. Helper `deriveThumbnails` agrega thumbnailUrl=imageUrl. Se actualizaron: schema Prisma, tipo ProductImage, schema Valibot, 5 schemas entrada, 5 services, 4 selects, 4 types response, 3 mappers, SQL search engine, seed. |
| 2026-02-25 | Address | Módulo completo: Address model + migración de Delivery | Nuevo modelo Address con CRUD completo (4 shop + 1 backoffice). Delivery migrado de campos planos (address, city, state, cp, notes) a FK `addressId` apuntando a Address. Soft delete con auto-filter en $extends. Single default enforcement. Adapter para verificar envíos activos. 50 archivos nuevos, 4 modificados (schema.prisma, prisma.ts, server/index.ts, order.selects.ts). |
| 2026-02-25 | Shipment | Módulo completo: reemplaza Delivery por Shipment + ShipmentEvent | Modelo Delivery eliminado, reemplazado por Shipment (7 estados, 3 tipos entrega) + ShipmentEvent (timeline). Haversine para cálculo de fee por zonas. Socket notifications para cambios de estado. Integración con checkout (POST /order ahora requiere deliveryType + addressId). ~55 archivos nuevos en shipment/, 5 en otros módulos. 17 archivos modificados. 3 archivos eliminados. |
| 2026-02-25 | Order | Checkout flow: addressSnapshot + validaciones + response enriquecido | addressSnapshot JSONB en Order guarda copia de dirección al momento del checkout. Validaciones: addressId requerido para non-PICKUP, ownership check, disponibilidad de entrega vía calculateDeliveryFee. CheckoutResult enriquecido con subtotal, totalDiscount, total, shipment { id, type, status }. |
| 2026-02-25 | Order | Nuevos endpoints: GET /order/:orderId y GET /order/:orderId/payment-info | Detalle de orden para comprador con totales calculados. Payment-info incluye datos bancarios de payment.config.ts, concepto, y último pago. Ownership check en ambos. |
| 2026-02-25 | Payments | Fix payment amount: incluir deliveryFee | submit-payment.service ahora suma shipment.deliveryFee al monto total del pago. Config bancaria en payment.config.ts con env vars + fallbacks. |
| 2026-02-25 | Order Expiration | FailShipmentHandler en pipeline de expiración | Al expirar una orden, el shipment se marca como FAILED + se crea ShipmentEvent. Pipeline: Cancel → FailShipment → Notify → Audit. Skip si shipment ya es FAILED o DELIVERED. |
| 2026-03-01 | Payments | Pago contra entrega (CASH_ON_DELIVERY) | Nuevo PaymentMethod + CashOnDeliveryProvider. Solo disponible para HOME_DELIVERY (≤60km). El payment se crea automáticamente en checkout, la orden se confirma inmediatamente (CONFIRMED) y el shipment avanza a PREPARING. Sin expiración. Al marcar DELIVERED → payment auto-APPROVED + stock deducido. Al marcar FAILED → payment CANCELLED + stock liberado + orden cancelada. Nuevo PaymentStatus CANCELLED. Guard en submit-payment y upload-proof. Payment expiration excluye COD. 4 archivos nuevos, 14 modificados. |
| 2026-03-01 | Messaging | Strategy Pattern: módulo `src/lib/messaging/` desacopla envío de mensajes | Nuevo módulo con interface `MessageProvider`, `MessagingService` (registry), y 5 providers (TwilioSms, TwilioWhatsApp, Log, LogEmail). OTP desacoplado del envío — callers reciben código y llaman `messaging.send()`. Configuración por `SMS_MODE` env var. Auth y Payments migrados al nuevo sistema. 10 archivos nuevos, 6 modificados en auth/payments. |

---

## Notas para Claude

- Cuando crees un módulo nuevo, seguir la misma estructura de capas y patrones documentados aquí.
- Antes de trabajar en un módulo no documentado, leerlo primero y agregar su sección aquí.
- Cada PR o cambio significativo debe registrar la decisión en la tabla de arriba.
- Si un patrón nuevo emerge que contradice lo documentado, actualizar este archivo.
