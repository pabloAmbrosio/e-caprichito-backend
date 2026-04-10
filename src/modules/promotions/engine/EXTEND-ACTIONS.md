# Como Extender las Acciones del Engine

> Guia paso a paso para agregar un nuevo tipo de accion (descuento) al motor de promociones.
> Explica donde se llama cada pieza, como se conectan, y que pasa si te salteas un paso.

---

## Que es una Accion en el Engine

Una accion es el **descuento o beneficio** que se aplica cuando una promocion pasa todas sus reglas. Cada promocion puede tener una o mas acciones. Ejemplo: "20% de descuento sobre el carrito" es una accion de tipo `PERCENTAGE_DISCOUNT`.

**Las 3 acciones actuales:**
- `PERCENTAGE_DISCOUNT` — descuento porcentual (ej: 20% off)
- `FIXED_DISCOUNT` — descuento fijo (ej: $1000 off)
- `BUY_X_GET_Y` — compra X y lleva Y gratis (ej: 2x1)

---

## Donde se Llaman las Acciones (Call Chain Completa)

```
  Cliente envia POST /promotions/apply-coupon
       |
       v
  applyCouponHandler (handlers/apply-coupon.handler.ts)
       |
       v
  applyPromotionsService (services/apply-promotions.service.ts)
       |
       v
  PromotionEngine.evaluate(context)  (engine/promotion-engine.ts:92)
       |
       |  Paso 1: getEligiblePromotions()  → trae promos de la DB con sus actions
       |  Paso 2: filterByUsageLimits()    → filtra por maxUsesPerUser
       |  Paso 3: evaluateRules()          → filtra por reglas
       |  Paso 4: resolver.resolve()       → prioridad y stacking
       |
       v
  ┌─────────────────────────────────────────────────────────────────┐
  │  Paso 5: applyActions()  (promotion-engine.ts:285)              │
  │                                                                  │
  │  currentTotal = cartTotal  (el total va bajando)                │
  │                                                                  │
  │  Para CADA promocion resuelta (en orden de prioridad):          │
  │    Para CADA accion de esa promocion:                            │
  │      1. Busca el applier en el registry por action.type          │
  │         const applier = this.actionAppliers[action.type]         │
  │         (promotion-engine.ts:299)                                │
  │                                                                  │
  │      2. Convierte la accion de Prisma al tipo discriminado       │
  │         { type, value, maxDiscount, target }                     │
  │         (promotion-engine.ts:303-308)                            │
  │                                                                  │
  │      3. Llama al applier:                                        │
  │         applier.apply(typedAction, context, currentTotal)        │
  │         → retorna el monto de descuento (number)                 │
  │         (promotion-engine.ts:311)                                │
  │                                                                  │
  │      4. Acumula el descuento:                                    │
  │         promoDiscount += discount                                │
  │                                                                  │
  │    Si promoDiscount > 0:                                         │
  │      currentTotal -= promoDiscount  (el total baja)              │
  │      totalDiscount += promoDiscount                              │
  │      Se registra en appliedPromotions[]                          │
  └─────────────────────────────────────────────────────────────────┘
       |
       v
  Retorna EngineResult:
  { originalTotal, finalTotal, totalDiscount, appliedPromotions[] }
```

**Lo que tu applier recibe:**
- `action`: objeto con `{ type, value, maxDiscount, target }` — lo que el admin configuro
- `context`: el `PromotionContext` completo (carrito, usuario, etc.)
- `currentTotal`: el total **actual** del carrito (ya con descuentos previos aplicados)

**Lo que tu applier retorna:**
- Un `number` con el monto de descuento (ej: `2500` para $25.00)

---

## Detalle: Como se Aplican Secuencialmente

Los descuentos se aplican **en cascada sobre el total restante**, no sobre el original:

```
Carrito original: $10000

Promo A (priority: 100): PERCENTAGE_DISCOUNT 20%
  → descuento = $10000 × 0.20 = $2000
  → currentTotal = $10000 - $2000 = $8000

Promo B (priority: 50): FIXED_DISCOUNT $500
  → descuento = min($500, $8000) = $500
  → currentTotal = $8000 - $500 = $7500

Resultado: originalTotal=$10000, finalTotal=$7500, totalDiscount=$2500
```

Tu applier recibe `currentTotal` ya actualizado. Si Promo A desconto $2000, tu applier ve `currentTotal = $8000`, no `$10000`.

---

## Los 6 Archivos que Tenes que Tocar

Vamos a usar como ejemplo una nueva accion `FREE_SHIPPING` (envio gratis si el carrito cumple cierta condicion).

### Paso 1: Prisma — Agregar al enum `ActionType`

**Archivo:** `prisma/schema.prisma` (linea 126)

```prisma
enum ActionType {
  PERCENTAGE_DISCOUNT
  FIXED_DISCOUNT
  BUY_X_GET_Y
  FREE_SHIPPING        // ← tu nueva accion
}
```

Despues correr:

```bash
npx prisma generate
```

> **Sin esto:** la DB no acepta el nuevo tipo y Prisma no lo reconoce.

---

### Paso 2: Interfaz tipada — Definir la forma de tu accion

**Archivo:** `types/action-types.ts`

Cada accion tiene 4 campos fijos que el engine espera (lineas 303-308 del engine):

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `type` | literal string | Discriminante (tu nuevo tipo) |
| `value` | `string` | El valor de la accion (lo que necesites, siempre string) |
| `maxDiscount` | `number \| null` | Tope maximo de descuento (null = sin tope) |
| `target` | `'PRODUCT' \| 'CART' \| 'CHEAPEST_ITEM'` | A que se aplica |

```typescript
/**
 * Accion de envio gratis.
 * El campo `value` contiene el monto maximo de envio cubierto como string.
 * Si el envio cuesta menos que el valor, se cubre completo.
 * Ejemplo: { type: 'FREE_SHIPPING', value: '500', maxDiscount: null, target: 'CART' }
 */
export interface FreeShippingAction {
  readonly type: 'FREE_SHIPPING';
  /** Monto maximo de envio cubierto como string (ej: "500") */
  readonly value: string;
  /** No aplica para FREE_SHIPPING, siempre null */
  readonly maxDiscount: number | null;
  /** Siempre CART para envio gratis */
  readonly target: 'PRODUCT' | 'CART' | 'CHEAPEST_ITEM';
}
```

> **Sin esto:** TypeScript no sabe que forma tiene tu accion y no puede tipar el applier.

---

### Paso 3: Agregar a `TypedPromotionAction` y (opcionalmente) a `ActionResult`

**Archivo:** `types/action-types.ts`

```typescript
// Union discriminada — agregar al final
export type TypedPromotionAction =
  | PercentageDiscountAction
  | FixedDiscountAction
  | BuyXGetYAction
  | FreeShippingAction;      // ← agregar aca
```

Si tu accion tiene un tipo de resultado especial (como `BUY_X_GET_Y` que retorna `freeItems`), tambien actualizar el conditional type:

```typescript
export type ActionResult<T extends TypedPromotionAction['type']> =
  T extends 'PERCENTAGE_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'FIXED_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'BUY_X_GET_Y' ? FreeItemDiscountResult :
  T extends 'FREE_SHIPPING' ? MonetaryDiscountResult :   // ← agregar aca
  never;
```

> **ACA es donde TypeScript empieza a dar error.** El `ActionApplierRegistry` del engine (lineas 51-53) se genera de `TypedPromotionAction`, asi que ahora exige un applier para `FREE_SHIPPING`.

```typescript
// Este tipo en promotion-engine.ts:51-53 ahora exige FREE_SHIPPING:
type ActionApplierRegistry = {
  [K in TypedPromotionAction['type']]: IActionApplier<Extract<TypedPromotionAction, { type: K }>>;
};
// ERROR: Property 'FREE_SHIPPING' is missing in type...
```

---

### Paso 4: Crear el applier

**Nuevo archivo:** `engine/action-appliers/free-shipping.applier.ts`

Tu applier implementa `IActionApplier<TuAccion>` con un solo metodo: `apply(action, context, currentTotal): number`.

```typescript
/**
 * Aplicador de accion FREE_SHIPPING.
 *
 * Calcula el descuento de envio gratis. El `value` contiene el
 * costo de envio como string. El descuento es ese monto (o menos
 * si excede el total actual).
 *
 * Ejemplo: envio cuesta $500, carrito vale $3000
 * → descuento = min($500, $3000) = $500
 */
import type { IActionApplier } from './action-applier.interface';
import type { FreeShippingAction } from '../../types';
import type { PromotionContext } from '../../types';

export class FreeShippingApplier implements IActionApplier<FreeShippingAction> {
  /**
   * Calcula el monto de descuento por envio gratis.
   *
   * @param action - Accion con el costo de envio en value
   * @param context - Contexto del carrito (no se usa directamente)
   * @param currentTotal - Total actual del carrito
   * @returns Monto de descuento (costo del envio, limitado al total)
   */
  apply(action: FreeShippingAction, context: PromotionContext, currentTotal: number): number {
    /** Costo de envio parseado de string */
    const shippingCost = parseFloat(action.value);
    if (isNaN(shippingCost) || shippingCost <= 0) return 0;

    /** El descuento es el costo del envio, sin exceder el total */
    const discount = Math.min(shippingCost, currentTotal);

    /** Aplicar tope maximo si existe */
    if (action.maxDiscount !== null && discount > action.maxDiscount) {
      return Math.min(action.maxDiscount, currentTotal);
    }

    return Math.max(discount, 0);
  }
}
```

**Reglas que tu applier debe seguir:**
1. Es **sincrono** — retorna `number`, no `Promise<number>`
2. El descuento **nunca es negativo**: `Math.max(discount, 0)`
3. El descuento **nunca excede `currentTotal`**: `Math.min(discount, currentTotal)`
4. Parsea `action.value` de string a lo que necesite
5. Respeta `action.maxDiscount` si no es null
6. No modifica el `context` — es readonly

**Referencia de appliers existentes:**

| Applier | Complejidad | Buen ejemplo para... |
|---------|------------|---------------------|
| `FixedDiscountApplier` | Simple | Acciones con monto fijo |
| `PercentageDiscountApplier` | Media | Acciones con logica de `target` (CART, PRODUCT, CHEAPEST_ITEM) |
| `BuyXGetYApplier` | Alta | Acciones con parseo complejo de `value` y logica con items |

---

### Paso 5: Exportar desde el barrel

**Archivo:** `engine/action-appliers/index.ts`

```typescript
export * from './action-applier.interface';
export * from './percentage-discount.applier';
export * from './fixed-discount.applier';
export * from './buy-x-get-y.applier';
export * from './free-shipping.applier';      // ← agregar aca
```

---

### Paso 6: Registrar en el engine

**Archivo:** `engine/promotion-engine.ts` (linea 74-78)

```typescript
private readonly actionAppliers: ActionApplierRegistry = {
  PERCENTAGE_DISCOUNT: new PercentageDiscountApplier(),
  FIXED_DISCOUNT: new FixedDiscountApplier(),
  BUY_X_GET_Y: new BuyXGetYApplier(),
  FREE_SHIPPING: new FreeShippingApplier(),    // ← agregar aca
};
```

Agregar el import al inicio del archivo:

```typescript
import { FreeShippingApplier } from './action-appliers/free-shipping.applier';
```

> **Con esto TypeScript deja de dar error.** El registry ahora tiene todas las keys que `TypedPromotionAction` exige.

---

### Paso 7 (opcional): Validacion API en constants

**Archivo:** `constants.ts` (linea 80-84)

```typescript
export const ACTION_TYPES = [
  'PERCENTAGE_DISCOUNT',
  'FIXED_DISCOUNT',
  'BUY_X_GET_Y',
  'FREE_SHIPPING',         // ← agregar aca
] as const;
```

Sin esto, el endpoint `POST /promotions/:id/actions` rechaza `FREE_SHIPPING` como tipo invalido.

Si tu accion necesita un nuevo `target`, tambien agregarlo:

```typescript
export const ACTION_TARGETS = [
  'PRODUCT',
  'CART',
  'CHEAPEST_ITEM',
  // 'SHIPPING',   ← si necesitaras un target nuevo
] as const;
```

---

## Como el Engine Llama a Tu Applier (Tracing Exacto)

Cuando el engine procesa una promocion que tiene una accion `FREE_SHIPPING`:

```typescript
// promotion-engine.ts:293-327

for (const promo of promotions) {
  let promoDiscount = 0;
  let lastActionType = '';

  for (const action of promo.actions) {

    // 1. action.type es "FREE_SHIPPING" (string de Prisma)
    //    Busca en el registry: this.actionAppliers["FREE_SHIPPING"]
    //    → obtiene tu instancia de FreeShippingApplier
    const applier = this.actionAppliers[action.type as keyof ActionApplierRegistry];

    // 2. Si no existe applier, lo salta
    if (!applier) continue;

    // 3. Convierte la accion plana de Prisma al tipo discriminado
    const typedAction = {
      type: action.type,            // "FREE_SHIPPING"
      value: action.value,          // "500" (string de la DB)
      maxDiscount: action.maxDiscount ? Number(action.maxDiscount) : null,
      target: action.target,        // "CART"
    } as TypedPromotionAction;

    // 4. Llama a TU applier:
    //    FreeShippingApplier.apply(typedAction, context, currentTotal)
    //    → retorna 500 (el monto de descuento)
    const discount = applier.apply(typedAction as any, context, currentTotal);

    // 5. Acumula el descuento de esta accion
    promoDiscount += discount;   // promoDiscount = 500
    lastActionType = action.type; // "FREE_SHIPPING"
  }

  // 6. Si hubo descuento, actualiza totales y registra
  if (promoDiscount > 0) {
    currentTotal -= promoDiscount;   // $8000 - $500 = $7500
    totalDiscount += promoDiscount;  // acumulado total
    appliedPromotions.push({
      promotionId: promo.id,
      promotionName: promo.name,
      discountAmount: Math.round(promoDiscount * 100) / 100,
      actionType: lastActionType,    // "FREE_SHIPPING"
    });
  }
}
```

---

## Diferencia Clave: Una Promo Puede Tener Multiples Acciones

Una sola promocion puede tener varias acciones que se acumulan:

```
Promocion "Super Sale"
  Accion 1: PERCENTAGE_DISCOUNT 10% CART
  Accion 2: FREE_SHIPPING $500

Carrito: $10000

Evaluacion de acciones (dentro del mismo promo loop):
  Accion 1: $10000 × 0.10 = $1000
  Accion 2: min($500, $10000) = $500
  promoDiscount = $1000 + $500 = $1500

currentTotal = $10000 - $1500 = $8500
```

**Gotcha:** ambas acciones reciben el MISMO `currentTotal` de entrada ($10000 en este caso), porque `currentTotal` se actualiza solo al final de cada promocion (linea 318), no entre acciones de la misma promo.

---

## Ejemplo Completo: Accion FREE_SHIPPING en Accion

```
ESCENARIO:
  Promocion "Envio Gratis en Compras +$5000"
  - priority: 50, stackable: true
  - Reglas:
    1. CART_MIN_TOTAL, GREATER_OR_EQUAL, "5000"
  - Acciones:
    1. FREE_SHIPPING, value: "800", target: CART

CONTEXTO:
  cartTotal: 7500
  cartItems: [
    { title: "Remera", price: 3000, quantity: 1 },
    { title: "Jean", price: 4500, quantity: 1 }
  ]

EVALUACION DE REGLAS:
  CartMinTotalEvaluator: 7500 >= 5000? SI → true
  ruleOperator: ALL → ✅ Promocion aplica

APLICACION DE ACCIONES:
  FreeShippingApplier.apply(
    { type: 'FREE_SHIPPING', value: '800', maxDiscount: null, target: 'CART' },
    context,
    7500    ← currentTotal
  )
  → shippingCost = 800
  → discount = min(800, 7500) = 800

RESULTADO:
  {
    originalTotal: 7500,
    finalTotal: 6700,
    totalDiscount: 800,
    appliedPromotions: [
      {
        promotionId: "...",
        promotionName: "Envio Gratis en Compras +$5000",
        discountAmount: 800,
        actionType: "FREE_SHIPPING"
      }
    ]
  }
```

---

## Comparacion con las Acciones Existentes

| Aspecto | PERCENTAGE_DISCOUNT | FIXED_DISCOUNT | BUY_X_GET_Y |
|---------|-------------------|---------------|-------------|
| **value** | Porcentaje: `"20"` | Monto: `"1000"` | Relacion: `"2:1"` |
| **Parseo** | `parseFloat(value)` | `parseFloat(value)` | `value.split(':')` |
| **Usa target?** | Si (CART, PRODUCT, CHEAPEST_ITEM) | Si | No directamente |
| **Usa maxDiscount?** | Si | Si | No (siempre null) |
| **Complejidad** | Media | Baja | Alta |

Al crear tu accion, decidir:
- **Que va en `value`**: siempre es string, tu parseas
- **Si usa `target`**: define sobre que calcula el descuento
- **Si usa `maxDiscount`**: tope maximo del descuento

---

## Checklist Rapido

| # | Archivo | Que hacer | TS error si falta? |
|---|---------|-----------|-------------------|
| 1 | `prisma/schema.prisma` | Agregar a `enum ActionType` + `prisma generate` | No (runtime) |
| 2 | `types/action-types.ts` | Crear `interface TuAccionAction` | No |
| 3 | `types/action-types.ts` | Agregar a `TypedPromotionAction` (y `ActionResult` si aplica) | **SI** |
| 4 | `engine/action-appliers/` | Crear `tu-accion.applier.ts` | **SI** |
| 5 | `engine/action-appliers/index.ts` | Export del applier | No |
| 6 | `engine/promotion-engine.ts` | Registrar en `actionAppliers` | **SI** |
| 7 | `constants.ts` | Agregar a `ACTION_TYPES` (opcional, para API) | No (API rechaza) |

Los pasos marcados con "SI" causan error de compilacion si los salteas, gracias al `TypedPromotionAction` y `ActionApplierRegistry`.
