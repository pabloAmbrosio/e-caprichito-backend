# Como Extender las Reglas del Engine

> Guia paso a paso para agregar un nuevo tipo de regla al motor de promociones.
> Explica donde se llama cada pieza, como se conectan, y que pasa si te salteas un paso.

---

## Que es una Regla en el Engine

Una regla es una **condicion** que se evalua contra el contexto del carrito/usuario. Si todas (o alguna) de las reglas de una promocion se cumplen, la promocion es candidata para aplicar su descuento.

**Ejemplo real del sistema:** "El total del carrito debe ser mayor o igual a $5000" es una regla de tipo `CART_MIN_TOTAL`.

---

## Donde se Llaman las Reglas (Call Chain Completa)

```
  Cliente envia POST /promotions/apply-coupon
       |
       v
  applyCouponHandler (handlers/apply-coupon.handler.ts)
       |
       v
  applyPromotionsService (services/apply-promotions.service.ts)
       |  construye el PromotionContext
       v
  PromotionEngine.evaluate(context)  (engine/promotion-engine.ts:92)
       |
       |  Paso 1: getEligiblePromotions()  → trae promos de la DB con sus rules
       |  Paso 2: filterByUsageLimits()    → filtra por maxUsesPerUser
       |
       v
  ┌─────────────────────────────────────────────────────────────────┐
  │  Paso 3: evaluateRules()  (promotion-engine.ts:244)             │
  │                                                                  │
  │  Para CADA promocion:                                            │
  │    Para CADA regla de esa promocion:                             │
  │      1. Busca el evaluador en el registry por rule.type          │
  │         const evaluator = this.ruleEvaluators[rule.type]         │
  │         (promotion-engine.ts:254)                                │
  │                                                                  │
  │      2. Convierte la regla de Prisma al tipo discriminado        │
  │         { type, operator, value } as TypedPromotionRule          │
  │         (promotion-engine.ts:258-262)                            │
  │                                                                  │
  │      3. Llama al evaluador:                                      │
  │         evaluator.evaluate(typedRule, context) → boolean         │
  │         (promotion-engine.ts:264)                                │
  │                                                                  │
  │    Aplica operador logico:                                       │
  │      ruleOperator === 'ALL' → .every(Boolean)  (AND)            │
  │      ruleOperator === 'ANY' → .some(Boolean)   (OR)             │
  └─────────────────────────────────────────────────────────────────┘
       |
       v
  Paso 4: resolver.resolve()  → prioridad y stacking
  Paso 5: applyActions()      → calcula descuentos
```

**Lo que tu evaluador recibe:**
- `rule`: objeto con `{ type, operator, value }` — los datos que el admin configuro
- `context`: el `PromotionContext` completo con carrito, usuario, etc.

**Lo que tu evaluador retorna:**
- `true` si la regla se cumple
- `false` si no

---

## Los 6 Archivos que Tenes que Tocar

### Paso 1: Prisma — Agregar al enum `RuleType`

**Archivo:** `prisma/schema.prisma` (linea 102)

```prisma
enum RuleType {
  PRODUCT
  CATEGORY
  TAG
  CART_MIN_TOTAL
  CART_MIN_QUANTITY
  CUSTOMER_ROLE
  FIRST_PURCHASE
  DATE_RANGE          // ← tu nueva regla
}
```

Despues correr:

```bash
npx prisma generate
```

Esto regenera el cliente de Prisma con el nuevo valor en el enum.

> **Sin esto:** la DB no acepta el nuevo tipo y Prisma no lo reconoce como valor valido.

---

### Paso 2: Interfaz tipada — Definir la forma de tu regla

**Archivo:** `types/rule-types.ts`

Crear la interfaz siguiendo el patron de las existentes. Elegir el tipo de operador segun tu logica:

- `EqualityOperator` → para comparaciones de igualdad/pertenencia: `EQUALS | NOT_EQUALS | IN | NOT_IN`
- `NumericOperator` → para comparaciones numericas: `GREATER_THAN | LESS_THAN | GREATER_OR_EQUAL | LESS_OR_EQUAL | EQUALS`
- Literal especifico → para operadores limitados (como `FirstPurchaseRule` que solo usa `'EQUALS'`)

```typescript
/**
 * Regla de rango de fecha: evalua si la compra se hace dentro de un rango.
 * El campo `value` contiene dos fechas ISO separadas por coma.
 * Ejemplo: { type: 'DATE_RANGE', operator: 'IN', value: '2026-06-01,2026-06-30' }
 */
export interface DateRangeRule {
  readonly type: 'DATE_RANGE';
  readonly operator: 'IN' | 'NOT_IN';  // operadores que tienen sentido para fechas
  readonly value: string;
}
```

**Convencion:** el `value` siempre es `string` porque asi lo guarda Prisma. Tu evaluador se encarga de parsearlo.

> **Sin esto:** TypeScript no sabe que forma tiene tu regla y no puede tipar el evaluador.

---

### Paso 3: Agregar a `TypedPromotionRule` (la union) y `RuleTypeMap` (el mapped type)

**Archivo:** `types/rule-types.ts` (lineas 115-144)

```typescript
// Union discriminada — agregar al final
export type TypedPromotionRule =
  | ProductRule
  | CategoryRule
  | TagRule
  | CartMinTotalRule
  | CartMinQuantityRule
  | CustomerRoleRule
  | FirstPurchaseRule
  | DateRangeRule;        // ← agregar aca

// Mapped type — agregar la key
export type RuleTypeMap = {
  PRODUCT: ProductRule;
  CATEGORY: CategoryRule;
  TAG: TagRule;
  CART_MIN_TOTAL: CartMinTotalRule;
  CART_MIN_QUANTITY: CartMinQuantityRule;
  CUSTOMER_ROLE: CustomerRoleRule;
  FIRST_PURCHASE: FirstPurchaseRule;
  DATE_RANGE: DateRangeRule;  // ← agregar aca
};
```

**Por que dos lugares?**
- `TypedPromotionRule` es la union que se usa para castear la regla de Prisma (linea 262 del engine)
- `RuleTypeMap` es el mapped type que genera el `RuleEvaluatorRegistry` — esto es lo que **fuerza** a que exista un evaluador por cada tipo

> **ACA es donde TypeScript empieza a dar error.** El `RuleEvaluatorRegistry` del engine (linea 43-45) se genera de `RuleTypeMap`, asi que ahora exige un evaluador para `DATE_RANGE` que aun no existe.

```
// Este tipo en promotion-engine.ts:43-45 ahora exige DATE_RANGE:
type RuleEvaluatorRegistry = {
  [K in keyof RuleTypeMap]: IRuleEvaluator<RuleTypeMap[K]>;
};
// ERROR: Property 'DATE_RANGE' is missing in type...
```

---

### Paso 4: Crear el evaluador

**Nuevo archivo:** `engine/rule-evaluators/date-range.evaluator.ts`

Tu evaluador implementa `IRuleEvaluator<TuRegla>` con un solo metodo: `evaluate(rule, context): boolean`.

```typescript
/**
 * Evaluador de reglas de tipo DATE_RANGE.
 *
 * Evalua si la fecha actual esta dentro de un rango.
 * El campo `value` contiene dos fechas ISO separadas por coma.
 *
 * Operadores soportados:
 * - IN: la fecha actual esta DENTRO del rango
 * - NOT_IN: la fecha actual esta FUERA del rango
 */
import type { IRuleEvaluator } from './rule-evaluator.interface';
import type { DateRangeRule } from '../../types';
import type { PromotionContext } from '../../types';

export class DateRangeEvaluator implements IRuleEvaluator<DateRangeRule> {
  /**
   * Evalua si la fecha actual cae dentro del rango especificado.
   *
   * @param rule - Regla con value "2026-06-01,2026-06-30"
   * @param context - Contexto (no se usa directamente, pero el engine siempre lo pasa)
   * @returns true si la condicion de fecha se cumple
   */
  evaluate(rule: DateRangeRule, context: PromotionContext): boolean {
    const parts = rule.value.split(',').map((d) => d.trim());
    if (parts.length !== 2) return false;

    const startDate = new Date(parts[0]);
    const endDate = new Date(parts[1]);
    const now = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

    const isInRange = now >= startDate && now <= endDate;

    switch (rule.operator) {
      case 'IN':
        return isInRange;
      case 'NOT_IN':
        return !isInRange;
      default:
        return false;
    }
  }
}
```

**Reglas que tu evaluador debe seguir:**
1. Es **sincrono** — retorna `boolean`, no `Promise<boolean>`. No hace queries a DB.
2. Parsea `rule.value` de string a lo que necesite (el value siempre es string en Prisma)
3. Retorna `false` en el `default` del switch y ante datos invalidos (defensive coding)
4. No modifica el `context` — es readonly

---

### Paso 5: Exportar desde el barrel

**Archivo:** `engine/rule-evaluators/index.ts`

```typescript
export * from './rule-evaluator.interface';
export * from './product-rule.evaluator';
export * from './category-rule.evaluator';
export * from './tag-rule.evaluator';
export * from './cart-min-total.evaluator';
export * from './cart-min-quantity.evaluator';
export * from './customer-role.evaluator';
export * from './first-purchase.evaluator';
export * from './date-range.evaluator';      // ← agregar aca
```

---

### Paso 6: Registrar en el engine

**Archivo:** `engine/promotion-engine.ts` (linea 63-71)

```typescript
private readonly ruleEvaluators: RuleEvaluatorRegistry = {
  PRODUCT: new ProductRuleEvaluator(),
  CATEGORY: new CategoryRuleEvaluator(),
  TAG: new TagRuleEvaluator(),
  CART_MIN_TOTAL: new CartMinTotalEvaluator(),
  CART_MIN_QUANTITY: new CartMinQuantityEvaluator(),
  CUSTOMER_ROLE: new CustomerRoleEvaluator(),
  FIRST_PURCHASE: new FirstPurchaseEvaluator(),
  DATE_RANGE: new DateRangeEvaluator(),        // ← agregar aca
};
```

Agregar el import al inicio del archivo:

```typescript
import { DateRangeEvaluator } from './rule-evaluators/date-range.evaluator';
```

> **Con esto TypeScript deja de dar error.** El registry ahora tiene todas las keys que `RuleTypeMap` exige.

---

### Paso 7 (opcional): Validacion API en constants

**Archivo:** `constants.ts` (linea 57-65)

Si queres que el endpoint `POST /promotions/:id/rules` acepte el nuevo tipo:

```typescript
export const RULE_TYPES = [
  'PRODUCT',
  'CATEGORY',
  'TAG',
  'CART_MIN_TOTAL',
  'CART_MIN_QUANTITY',
  'CUSTOMER_ROLE',
  'FIRST_PURCHASE',
  'DATE_RANGE',         // ← agregar aca
] as const;
```

Este array se usa en los schemas Valibot con `v.picklist()` para validar el input de la API. Sin esto, la API rechaza `DATE_RANGE` como tipo invalido antes de que llegue al engine.

---

## Como el Engine Llama a Tu Evaluador (Tracing Exacto)

Cuando el engine procesa una promocion que tiene una regla `DATE_RANGE`:

```typescript
// promotion-engine.ts:253-264

// 1. Itera las reglas de la promocion
const ruleResults = promo.rules.map((rule: PromotionRule) => {

  // 2. rule.type es "DATE_RANGE" (string de Prisma)
  //    Busca en el registry: this.ruleEvaluators["DATE_RANGE"]
  //    → obtiene tu instancia de DateRangeEvaluator
  const evaluator = this.ruleEvaluators[rule.type as keyof RuleEvaluatorRegistry];

  // 3. Si no existe evaluador (no deberia pasar si seguiste los pasos), retorna false
  if (!evaluator) return false;

  // 4. Convierte la regla plana de Prisma al tipo discriminado
  const typedRule = {
    type: rule.type,       // "DATE_RANGE"
    operator: rule.operator, // "IN"
    value: rule.value,       // "2026-06-01,2026-06-30"
  } as TypedPromotionRule;

  // 5. Llama a TU evaluador:
  //    DateRangeEvaluator.evaluate({ type: 'DATE_RANGE', operator: 'IN', value: '...' }, context)
  return evaluator.evaluate(typedRule as any, context);
});

// 6. Aplica operador logico
if (promo.ruleOperator === 'ALL') {
  return ruleResults.every(Boolean);  // TODAS deben ser true
}
return ruleResults.some(Boolean);     // AL MENOS UNA true
```

---

## Si Tu Regla Necesita Datos Nuevos en el Contexto

A veces la regla necesita datos que no estan en el `PromotionContext` actual. Ejemplo: si quisieras una regla `PURCHASE_COUNT` que evalua cuantas compras anteriores tiene el usuario.

En ese caso, hay que extender el contexto:

**1. Agregar el campo a `PromotionContext`** en `types/engine-types.ts`:

```typescript
export interface PromotionContext {
  readonly userId: string;
  readonly customerRole: string | null;
  readonly cartItems: readonly CartItemForEngine[];
  readonly cartTotal: number;
  readonly couponCode?: string;
  readonly isFirstPurchase: boolean;
  readonly purchaseCount: number;  // ← nuevo campo
}
```

**2. Pre-computar el dato en `applyPromotionsService`** (`services/apply-promotions.service.ts`):

```typescript
const previousOrdersCount = await db.order.count({
  where: { customerId: input.userId, status: { not: 'CANCELLED' } },
});

const context: PromotionContext = {
  // ... campos existentes
  isFirstPurchase: previousOrdersCount === 0,
  purchaseCount: previousOrdersCount,  // ← pre-computar aca
};
```

**Patron clave:** Los evaluadores son **sincronos y puros** — no hacen queries a la DB. Cualquier dato que necesiten debe pre-computarse en el service y pasarse en el contexto.

---

## Ejemplo Completo: Regla DATE_RANGE en Accion

```
ESCENARIO:
  Promocion "Hot Sale Junio"
  - ruleOperator: ALL
  - Reglas:
    1. DATE_RANGE, IN, "2026-06-01,2026-06-30"
    2. CART_MIN_TOTAL, GREATER_OR_EQUAL, "3000"
  - Acciones:
    1. PERCENTAGE_DISCOUNT, 15%, target: CART

CONTEXTO (14 de junio, carrito de $5000):
  cartTotal: 5000
  fecha actual: 2026-06-14

EVALUACION:
  Regla 1: DateRangeEvaluator.evaluate(...)
    → 2026-06-14 esta entre 2026-06-01 y 2026-06-30? SI → true

  Regla 2: CartMinTotalEvaluator.evaluate(...)
    → 5000 >= 3000? SI → true

  ruleOperator: ALL → true AND true = ✅ Promocion aplica

RESULTADO:
  Descuento: 5000 × 0.15 = $750
```

---

## Checklist Rapido

| # | Archivo | Que hacer | TS error si falta? |
|---|---------|-----------|-------------------|
| 1 | `prisma/schema.prisma` | Agregar a `enum RuleType` + `prisma generate` | No (runtime) |
| 2 | `types/rule-types.ts` | Crear `interface TuReglaRule` | No |
| 3 | `types/rule-types.ts` | Agregar a `TypedPromotionRule` y `RuleTypeMap` | **SI** |
| 4 | `engine/rule-evaluators/` | Crear `tu-regla.evaluator.ts` | **SI** |
| 5 | `engine/rule-evaluators/index.ts` | Export del evaluador | No |
| 6 | `engine/promotion-engine.ts` | Registrar en `ruleEvaluators` | **SI** |
| 7 | `constants.ts` | Agregar a `RULE_TYPES` (opcional, para API) | No (API rechaza) |

Los pasos marcados con "SI" causan error de compilacion si los salteas, gracias al `RuleTypeMap` y `RuleEvaluatorRegistry`.
