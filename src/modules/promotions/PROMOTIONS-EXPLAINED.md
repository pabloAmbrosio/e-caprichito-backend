# Promotions Module - Handlers, Routes & Services

> Explicacion de las carpetas `handlers/`, `routes/` y `services/` del modulo de promociones.
> La carpeta `engine/` esta documentada en `ENGINE-EXPLAINED.md`.

---

## Arquitectura General

El modulo sigue una arquitectura de 3 capas que separa responsabilidades:

```
  HTTP Request
       |
       v
  ┌──────────┐    Valida schema, registra middleware
  │  ROUTES   │    (autenticacion + roles)
  └────┬─────┘
       |
       v
  ┌──────────┐    Extrae datos del request,
  │ HANDLERS  │    llama al service, formatea la response
  └────┬─────┘
       |
       v
  ┌──────────┐    Logica de negocio pura,
  │ SERVICES  │    interaccion con Prisma/DB
  └──────────┘
       |
       v
  ┌──────────┐
  │  ENGINE   │    (evaluacion de reglas y descuentos)
  └──────────┘
```

**Flujo de datos:** `Route → Handler → Service → DB/Engine`

---

## 1. Routes (`routes/`)

**Proposito:** Define los endpoints HTTP, vincula cada URL con su handler, aplica middleware de autenticacion/roles y schemas de validacion Valibot.

### Estructura

```
routes/
├── backoffice-promotion.routes.ts   ← CRUD admin (OWNER/ADMIN)
├── shop-promotion.routes.ts         ← Endpoints del cliente (cualquier usuario)
└── index.ts                         ← Barrel export
```

### 1.1 `backoffice-promotion.routes.ts`

**Proposito:** Rutas de administracion para gestionar promociones. Solo accesibles por usuarios con rol `OWNER` o `ADMIN`.

**Como funciona:**

1. Exporta una funcion `backofficePromotionRoutes` que recibe la instancia de Fastify
2. Cada ruta se registra con:
   - `preHandler`: array de middlewares (`authenticate` + `requireRoles`)
   - `schema`: validacion automatica del body/params/querystring via Valibot
   - `handler`: funcion que procesa la peticion

**Endpoints registrados:**

| Metodo   | URL                                    | Handler                  | Descripcion                |
|----------|----------------------------------------|--------------------------|----------------------------|
| `POST`   | `/promotions`                          | `createPromotionHandler` | Crear promocion            |
| `GET`    | `/promotions`                          | `listPromotionsHandler`  | Listar con paginacion      |
| `GET`    | `/promotions/:id`                      | `getPromotionHandler`    | Obtener por ID             |
| `PATCH`  | `/promotions/:id`                      | `updatePromotionHandler` | Actualizar parcialmente    |
| `DELETE` | `/promotions/:id`                      | `deletePromotionHandler` | Soft delete                |
| `POST`   | `/promotions/:id/rules`                | `addRuleHandler`         | Agregar regla              |
| `DELETE` | `/promotions/:id/rules/:ruleId`        | `removeRuleHandler`      | Eliminar regla             |
| `POST`   | `/promotions/:id/actions`              | `addActionHandler`       | Agregar accion             |
| `DELETE` | `/promotions/:id/actions/:actionId`    | `removeActionHandler`    | Eliminar accion            |

**Ejemplo de como se registra una ruta:**

```typescript
// Crear una nueva promocion
fastify.post(PROMOTION_URLS.BASE, {
  preHandler: [
    fastify.authenticate,                    // Verifica JWT valido
    fastify.requireRoles(['OWNER', 'ADMIN']),// Solo admin/owner
  ],
  schema: { body: CreatePromotionSchema },   // Valida body automaticamente
  handler: createPromotionHandler,           // Procesa la peticion
});
```

**Patron clave:** Las URLs no estan hardcodeadas, se importan de `constants.ts` via `PROMOTION_URLS`.

---

### 1.2 `shop-promotion.routes.ts`

**Proposito:** Ruta publica (para clientes autenticados) que permite previsualizar descuentos de un cupon.

**Endpoints registrados:**

| Metodo | URL                           | Handler              | Descripcion              |
|--------|-------------------------------|----------------------|--------------------------|
| `POST` | `/promotions/apply-coupon`    | `applyCouponHandler` | Preview de descuento     |

**Diferencia clave con backoffice:** Solo requiere `authenticate` (sin `requireRoles`), asi que cualquier usuario logueado puede usar este endpoint.

```typescript
fastify.post(PROMOTION_URLS.APPLY_COUPON, {
  preHandler: [fastify.authenticate],   // Solo JWT, sin roles
  schema: { body: ApplyCouponSchema },
  handler: applyCouponHandler,
});
```

**Ejemplo de peticion:**

```json
POST /api/promotions/apply-coupon
Authorization: Bearer <jwt-token>

{
  "couponCode": "VERANO20"
}
```

---

## 2. Handlers (`handlers/`)

**Proposito:** Capa intermedia entre las rutas y los servicios. Extrae datos del request (body, params, query), llama al service correspondiente, y formatea la respuesta HTTP (status codes, estructura JSON, manejo de errores).

### Estructura

```
handlers/
├── create-promotion.handler.ts    ← POST /promotions
├── update-promotion.handler.ts    ← PATCH /promotions/:id
├── delete-promotion.handler.ts    ← DELETE /promotions/:id
├── get-promotion.handler.ts       ← GET /promotions/:id
├── list-promotions.handler.ts     ← GET /promotions
├── add-rule.handler.ts            ← POST /promotions/:id/rules
├── remove-rule.handler.ts         ← DELETE /promotions/:id/rules/:ruleId
├── add-action.handler.ts          ← POST /promotions/:id/actions
├── remove-action.handler.ts       ← DELETE /promotions/:id/actions/:actionId
├── apply-coupon.handler.ts        ← POST /promotions/apply-coupon
└── index.ts                       ← Barrel export
```

### Patron comun de todos los handlers

Todos los handlers siguen el mismo patron estructural:

```
1. Extraer datos del request (body, params, query)
2. Llamar al service correspondiente
3. Retornar respuesta exitosa con formato estandar
4. Catch de errores → mapear error.message a status code HTTP
```

**Formato de respuesta estandar:**

```typescript
// Exito
{ success: true, message: "...", data: { ... } }

// Error
{ success: false, error: "mensaje de error" }
```

**Mapeo de errores:** Cada handler tiene un bloque `catch` que inspecciona `error.message` contra las constantes de `ERROR_MESSAGES` para retornar el status HTTP correcto:

| Error Message                  | HTTP Status |
|-------------------------------|-------------|
| `PROMOTION_NOT_FOUND`          | 404         |
| `PROMOTION_ALREADY_DELETED`    | 400         |
| `COUPON_ALREADY_EXISTS`        | 409         |
| `RULE_NOT_FOUND`               | 404         |
| `ACTION_NOT_FOUND`             | 404         |
| Errores de coupon (varios)     | 400         |
| Cualquier otro error           | 500         |

---

### 2.1 Handlers CRUD (create, update, delete, get, list)

#### `createPromotionHandler`

**Proposito:** Procesa `POST /promotions` para crear una nueva promocion.

```
Request.body  →  createPromotionService(data)  →  201 { success, data }
```

**Ejemplo de uso:**

```json
// Request
POST /api/backoffice/promotions
{
  "name": "Descuento Verano",
  "couponCode": "VERANO20",
  "startsAt": "2026-01-01T00:00:00Z",
  "endsAt": "2026-03-31T23:59:59Z",
  "priority": 10,
  "stackable": false,
  "ruleOperator": "ALL"
}

// Response 201
{
  "success": true,
  "message": "Promocion creada exitosamente",
  "data": {
    "id": "clxyz...",
    "name": "Descuento Verano",
    "couponCode": "VERANO20",
    "rules": [],
    "actions": []
  }
}
```

#### `updatePromotionHandler`

**Proposito:** Procesa `PATCH /promotions/:id` para actualizar parcialmente una promocion.

```
Request.params.id + Request.body  →  updatePromotionService(id, data)  →  200
```

Maneja 3 posibles errores: not found (404), already deleted (400), coupon duplicado (409).

#### `deletePromotionHandler`

**Proposito:** Procesa `DELETE /promotions/:id` para hacer soft delete.

```
Request.params.id  →  deletePromotionService(id)  →  200 { success, message }
```

**Nota:** No retorna `data` porque no hay nada util que mostrar despues de eliminar.

#### `getPromotionHandler`

**Proposito:** Procesa `GET /promotions/:id` para obtener una promocion con sus reglas y acciones.

```
Request.params.id  →  getPromotionService(id)  →  200 { success, data }
```

#### `listPromotionsHandler`

**Proposito:** Procesa `GET /promotions` con paginacion y filtros.

```
Request.query (page, limit, search, isActive, sortBy, sortOrder)
    →  listPromotionsService(params)
    →  200 { success, data, total, page, limit, totalPages }
```

**Ejemplo de peticion con filtros:**

```
GET /api/backoffice/promotions?page=1&limit=10&search=verano&isActive=true&sortBy=priority&sortOrder=desc
```

---

### 2.2 Handlers de Rules y Actions (add, remove)

#### `addRuleHandler`

**Proposito:** Procesa `POST /promotions/:id/rules` para agregar una regla a una promocion.

```
Request.params.id + Request.body  →  addRuleService(id, data)  →  201
```

**Ejemplo:**

```json
// Request
POST /api/backoffice/promotions/clxyz.../rules
{
  "type": "CART_MIN_TOTAL",
  "operator": "GREATER_OR_EQUAL",
  "value": "5000"
}

// Response 201
{
  "success": true,
  "message": "Regla agregada exitosamente",
  "data": {
    "id": "rule_abc...",
    "promotionId": "clxyz...",
    "type": "CART_MIN_TOTAL",
    "operator": "GREATER_OR_EQUAL",
    "value": "5000"
  }
}
```

#### `removeRuleHandler` / `removeActionHandler`

**Proposito:** Eliminan una regla o accion especifica de una promocion.

```
Request.params { id, ruleId }  →  removeRuleService(id, ruleId)  →  200
Request.params { id, actionId }  →  removeActionService(id, actionId)  →  200
```

#### `addActionHandler`

**Proposito:** Procesa `POST /promotions/:id/actions` para agregar una accion de descuento.

**Ejemplo:**

```json
// Request
POST /api/backoffice/promotions/clxyz.../actions
{
  "type": "PERCENTAGE_DISCOUNT",
  "value": 20,
  "maxDiscount": 10000,
  "target": "CART"
}

// Response 201
{
  "success": true,
  "message": "Accion agregada exitosamente",
  "data": {
    "id": "action_abc...",
    "type": "PERCENTAGE_DISCOUNT",
    "value": 20,
    "maxDiscount": 10000,
    "target": "CART"
  }
}
```

---

### 2.3 `applyCouponHandler` (el mas complejo)

**Proposito:** Procesa `POST /promotions/apply-coupon`. Este handler es especial porque orquesta multiples pasos para previsualizar los descuentos de un cupon en el carrito del usuario.

**Flujo completo paso a paso:**

```
  ┌─────────────────────────────┐
  │  1. Validar cupon           │  validateCouponService(code, userId)
  │     (existe, activo, fecha, │  → Lanza error si es invalido
  │      limite de usos)        │
  └──────────┬──────────────────┘
             |
             v
  ┌─────────────────────────────┐
  │  2. Obtener carrito activo  │  db.cart.findFirst(...)
  │     del usuario con items,  │  include: items → product → abstractProduct
  │     products y categories   │
  └──────────┬──────────────────┘
             |
             v
  ┌─────────────────────────────┐
  │  3. Transformar cart items  │  Mapear a CartItemForEngine[]
  │     al formato del engine   │  { productId, category, tags, price, qty }
  └──────────┬──────────────────┘
             |
             v
  ┌─────────────────────────────┐
  │  4. Evaluar promociones     │  applyPromotionsService({
  │     (automaticas + cupon)   │    userId, customerRole, cartItems,
  │     via el engine           │    cartTotal, couponCode
  │                             │  })
  └──────────┬──────────────────┘
             |
             v
  ┌─────────────────────────────┐
  │  5. Retornar preview        │  { originalTotal, finalTotal,
  │     de descuentos           │    totalDiscount, appliedPromotions }
  └─────────────────────────────┘
```

**Ejemplo completo de uso:**

```json
// Request
POST /api/promotions/apply-coupon
Authorization: Bearer <jwt-del-cliente>
{
  "couponCode": "VERANO20"
}

// Response 200
{
  "success": true,
  "message": "Cupon aplicado exitosamente",
  "data": {
    "originalTotal": 15000,
    "finalTotal": 12000,
    "totalDiscount": 3000,
    "appliedPromotions": [
      {
        "promotionId": "clxyz...",
        "promotionName": "Descuento Verano 20%",
        "discountAmount": 3000,
        "actionType": "PERCENTAGE_DISCOUNT"
      }
    ]
  }
}
```

**Gotcha importante:** Este handler NO crea una orden ni registra el uso del cupon. Solo retorna un **preview**. El registro real del uso (`recordUsageService`) ocurre cuando se confirma la orden.

---

## 3. Services (`services/`)

**Proposito:** Contiene toda la logica de negocio del modulo. Los services interactuan directamente con Prisma (base de datos) y el engine de promociones. No saben nada de HTTP (sin request/reply).

### Estructura

```
services/
├── create-promotion.service.ts     ← Crear promocion en DB
├── update-promotion.service.ts     ← Actualizar campos de promocion
├── delete-promotion.service.ts     ← Soft delete (marcar deletedAt)
├── get-promotion.service.ts        ← Obtener por ID con relaciones
├── list-promotions.service.ts      ← Listar con paginacion/filtros
├── add-rule.service.ts             ← Crear PromotionRule en DB
├── add-action.service.ts           ← Crear PromotionAction en DB
├── remove-rule.service.ts          ← Hard delete de una regla
├── remove-action.service.ts        ← Hard delete de una accion
├── apply-promotions.service.ts     ← Puente al engine de evaluacion
├── validate-coupon.service.ts      ← Validar cupon antes de aplicar
├── record-usage.service.ts         ← Registrar uso en una orden
└── index.ts                        ← Barrel export
```

---

### 3.1 Services CRUD

#### `createPromotionService`

**Proposito:** Crea una nueva promocion en la base de datos.

**Como funciona:**
1. Si se proporciono `couponCode`, verifica que no exista otra promocion con el mismo codigo (`findUnique`)
2. Si ya existe, lanza `COUPON_ALREADY_EXISTS`
3. Crea la promocion con `db.promotion.create()` usando valores por defecto para campos opcionales
4. Retorna la promocion creada con `rules` y `actions` incluidas (vacias al inicio)

**Valores por defecto:**
- `priority`: 0
- `stackable`: false
- `isActive`: true
- `ruleOperator`: 'ALL'

#### `updatePromotionService`

**Proposito:** Actualiza parcialmente una promocion (PATCH semantico).

**Como funciona:**
1. Busca la promocion por ID
2. Valida que exista y no este soft-deleted
3. Si se cambio el `couponCode`, valida unicidad
4. Construye un objeto `updateData` solo con los campos que fueron enviados (`!== undefined`)
5. Ejecuta `db.promotion.update()` y retorna con relaciones

**Patron clave:** Solo incluye en el `updateData` los campos que el usuario envio, evitando sobrescribir campos no mencionados con `null`.

```typescript
// Solo actualiza los campos enviados
if (data.name !== undefined) updateData.name = data.name;
if (data.priority !== undefined) updateData.priority = data.priority;
// ... etc
```

#### `deletePromotionService`

**Proposito:** Soft delete — marca `deletedAt` con la fecha actual sin borrar el registro.

**Como funciona:**
1. Busca la promocion por ID
2. Valida que exista y no haya sido eliminada previamente
3. Ejecuta `update` con `deletedAt: new Date()`

**Gotcha:** No es un `DELETE` real en la DB. La promocion sigue existiendo pero con `deletedAt` no-null. Todos los demas services filtran por `deletedAt === null`.

#### `getPromotionService`

**Proposito:** Obtiene una promocion por ID con todas sus relaciones.

**Como funciona:**
1. `findUnique` con `include: { rules, actions, _count: { usages } }`
2. Si no existe o tiene `deletedAt`, lanza `PROMOTION_NOT_FOUND`

**Nota:** Incluye `_count.usages` para saber cuantas veces se ha usado la promocion.

#### `listPromotionsService`

**Proposito:** Lista promociones con paginacion, busqueda y filtros.

**Como funciona:**
1. Calcula `skip` a partir de `page` y `limit` (con defaults de `constants.ts`)
2. Construye el objeto `where` con condiciones:
   - Siempre: `deletedAt: null` (excluye eliminadas)
   - Opcional: `isActive` si se paso como filtro
   - Opcional: busqueda por `name` o `couponCode` (case-insensitive con `OR`)
3. Ejecuta **en paralelo** (`Promise.all`): `findMany` + `count`
4. Retorna `{ data, total, page, limit, totalPages }`

**Ejemplo de query construido:**

```typescript
// Si params = { search: "verano", isActive: true, page: 2, limit: 5 }
where = {
  deletedAt: null,
  isActive: true,
  OR: [
    { name: { contains: "verano", mode: "insensitive" } },
    { couponCode: { contains: "verano", mode: "insensitive" } },
  ]
}
// skip = (2 - 1) * 5 = 5
```

---

### 3.2 Services de Rules y Actions

#### `addRuleService`

**Proposito:** Agrega una `PromotionRule` a una promocion existente.

**Como funciona:**
1. Valida que la promocion exista y no este eliminada
2. Crea la regla con `db.promotionRule.create()` usando los tipos de Prisma (`RuleType`, `ComparisonOperator`)

**Tipos de regla disponibles:**
- `PRODUCT` — aplica a productos especificos
- `CATEGORY` — aplica a una categoria (ROPA, ACCESORIOS, etc.)
- `TAG` — aplica a productos con ciertos tags
- `CART_MIN_TOTAL` — carrito con total minimo
- `CART_MIN_QUANTITY` — carrito con cantidad minima de items
- `CUSTOMER_ROLE` — usuario con rol especifico (VIP_FAN, etc.)
- `FIRST_PURCHASE` — primera compra del usuario

#### `addActionService`

**Proposito:** Agrega una `PromotionAction` (descuento) a una promocion.

**Como funciona:**
1. Valida que la promocion exista y no este eliminada
2. Crea la accion con `db.promotionAction.create()` usando los tipos `ActionType` y `ActionTarget`

**Tipos de accion disponibles:**
- `PERCENTAGE_DISCOUNT` — descuento porcentual (ej: 20% off)
- `FIXED_DISCOUNT` — descuento fijo (ej: $1000 off)
- `BUY_X_GET_Y` — compra X y lleva Y gratis

**Targets disponibles:**
- `CART` — descuento sobre el total del carrito
- `PRODUCT` — descuento sobre un producto especifico
- `CHEAPEST_ITEM` — descuento sobre el item mas barato

#### `removeRuleService` / `removeActionService`

**Proposito:** Eliminan una regla o accion de la base de datos.

**Como funcionan:**
1. Buscan el recurso por ID
2. Validan que pertenezca a la promocion indicada (`rule.promotionId !== promotionId`)
3. Ejecutan `delete` (**hard delete**, no soft delete)

**Gotcha:** A diferencia de las promociones que usan soft delete, las reglas y acciones se eliminan permanentemente.

---

### 3.3 Services de Evaluacion (los mas importantes)

#### `validateCouponService`

**Proposito:** Valida que un codigo de cupon sea usable antes de evaluar descuentos.

**Cadena de validaciones (en orden):**

```
¿Existe la promocion con ese couponCode?
    NO → "Cupon no encontrado o no valido"

¿Tiene deletedAt?
    SI → "Cupon no encontrado o no valido"

¿Esta activa (isActive)?
    NO → "La promocion no esta activa"

¿Ya comenzo (startsAt <= now)?
    NO → "La promocion aun no ha comenzado"

¿No ha expirado (endsAt >= now o null)?
    NO → "La promocion ha expirado"

¿El usuario no alcanzo maxUsesPerUser?
    NO → "Has alcanzado el limite de usos"

✅ Cupon valido → retorna la promocion con rules y actions
```

**Ejemplo de flujo con error:**

```typescript
// Usuario ya uso el cupon 2 veces, maxUsesPerUser = 2
await validateCouponService("VERANO20", "user_123");
// → throws Error("Has alcanzado el limite de usos para esta promocion")
```

---

#### `applyPromotionsService`

**Proposito:** Puente entre el sistema y el `PromotionEngine`. Es el punto de entrada para cualquier parte del sistema que necesite calcular descuentos.

**Como funciona:**

```
  Input (userId, customerRole, cartItems, cartTotal, couponCode?)
       |
       v
  1. Contar ordenes previas del usuario (no canceladas)
       → isFirstPurchase = (count === 0)
       |
       v
  2. Construir PromotionContext:
       { userId, customerRole, cartItems, cartTotal, couponCode, isFirstPurchase }
       |
       v
  3. new PromotionEngine().evaluate(context)
       |
       v
  4. Retornar EngineResult:
       { originalTotal, finalTotal, totalDiscount, appliedPromotions[] }
```

**Por que existe este service?** Desacopla la logica de "como preparo los datos" de "como evaluo las promociones". El engine no sabe nada de Prisma ni de ordenes; este service es quien pre-computa `isFirstPurchase` consultando la DB.

**Ejemplo:**

```typescript
const result = await applyPromotionsService({
  userId: "user_123",
  customerRole: "VIP_FAN",
  cartItems: [
    { productId: "prod_1", category: "ROPA", tags: ["verano"], price: 5000, quantity: 2, title: "Remera" },
    { productId: "prod_2", category: "ACCESORIOS", tags: [], price: 3000, quantity: 1, title: "Gorra" },
  ],
  cartTotal: 13000,
  couponCode: "VERANO20",
});

// Resultado:
// {
//   originalTotal: 13000,
//   finalTotal: 10400,
//   totalDiscount: 2600,
//   appliedPromotions: [
//     { promotionId: "...", promotionName: "Verano 20%", discountAmount: 2600, actionType: "PERCENTAGE_DISCOUNT" }
//   ]
// }
```

---

#### `recordUsageService`

**Proposito:** Registra que un usuario uso una promocion en una orden especifica.

**Como funciona:**
1. Recibe `{ promotionId, userId, orderId, discountAmount }` y opcionalmente un cliente de transaccion Prisma (`tx`)
2. Crea un registro en `PromotionUsage`
3. Si se paso `tx`, usa esa transaccion; si no, usa el cliente global `db`

**Patron clave — Transacciones:** Este service acepta un parametro `tx` para ejecutarse dentro de una transaccion de Prisma. Esto garantiza que si la creacion de la orden falla, el registro de uso tambien se revierte.

```typescript
// Dentro de la creacion de orden:
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ ... });

  // Registrar uso dentro de la misma transaccion
  await recordUsageService({
    promotionId: "promo_123",
    userId: "user_456",
    orderId: order.id,
    discountAmount: 2600,
  }, tx);
});
// Si algo falla, TODO se revierte
```

**Gotcha:** Este service NO se llama desde ningun handler del modulo de promotions. Se llama desde el modulo de **orders** al momento de confirmar una compra.

---

## Resumen de Dependencias

```
handlers/
  └── importa de → services/, constants, schemas (tipos)

routes/
  └── importa de → handlers/, schemas (validacion), constants (URLs)

services/
  ├── CRUD services → importa de → prisma (db), constants
  ├── validate-coupon → importa de → prisma (db), constants
  ├── apply-promotions → importa de → prisma (db), engine/
  └── record-usage → importa de → prisma (db), types
```

**Regla general:** Las capas solo importan "hacia abajo":
- Routes conocen handlers y schemas
- Handlers conocen services y constants
- Services conocen la DB y el engine
- Ninguna capa importa "hacia arriba"
