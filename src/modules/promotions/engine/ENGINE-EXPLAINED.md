# Promotion Engine - Explicación del Módulo

## Resumen

El **Promotion Engine** es el cerebro del sistema de promociones. Recibe datos del carrito y del usuario, evalúa qué promociones aplican, resuelve conflictos de prioridad/stacking, y calcula los descuentos finales.

Todo el módulo sigue el **Strategy Pattern**: cada tipo de regla y cada tipo de acción tiene su propia clase en su propio archivo. El engine orquesta todo sin un solo `switch` sobre tipos de regla o acción.

---

## Estructura de Archivos

```
engine/
├── promotion-engine.ts          ← Orquestador principal (el "cerebro")
├── promotion-resolver.ts        ← Resuelve prioridad y stacking
├── rule-evaluators/              ← Evaluadores de reglas (1 archivo = 1 tipo)
│   ├── rule-evaluator.interface.ts    ← Interfaz genérica IRuleEvaluator<T>
│   ├── product-rule.evaluator.ts      ← PRODUCT
│   ├── category-rule.evaluator.ts     ← CATEGORY
│   ├── tag-rule.evaluator.ts          ← TAG
│   ├── cart-min-total.evaluator.ts    ← CART_MIN_TOTAL
│   ├── cart-min-quantity.evaluator.ts ← CART_MIN_QUANTITY
│   ├── customer-role.evaluator.ts     ← CUSTOMER_ROLE
│   ├── first-purchase.evaluator.ts    ← FIRST_PURCHASE
│   └── index.ts                       ← Barrel export
├── action-appliers/              ← Aplicadores de descuento (1 archivo = 1 tipo)
│   ├── action-applier.interface.ts    ← Interfaz genérica IActionApplier<T>
│   ├── percentage-discount.applier.ts ← PERCENTAGE_DISCOUNT
│   ├── fixed-discount.applier.ts      ← FIXED_DISCOUNT
│   ├── buy-x-get-y.applier.ts        ← BUY_X_GET_Y
│   └── index.ts                       ← Barrel export
├── index.ts                      ← Barrel export del engine completo
└── ENGINE-EXPLAINED.md           ← Este archivo
```

---

## Flujo de Evaluación (Paso a Paso)

El engine ejecuta 5 pasos secuenciales. Si en cualquier paso no quedan promociones, retorna un resultado vacío (sin descuento).

```
┌──────────────────────────────────────────────────────────────────┐
│                    PromotionEngine.evaluate()                    │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │ 1. getEligible       │  Consulta BD: activas, en fecha,      │
│  │    Promotions()      │  no eliminadas, con/sin cupón          │
│  └──────────┬──────────┘                                        │
│             │ Promociones elegibles                              │
│  ┌──────────▼──────────┐                                        │
│  │ 2. filterByUsage    │  ¿El usuario ya usó esta promo         │
│  │    Limits()         │  más de maxUsesPerUser veces?           │
│  └──────────┬──────────┘                                        │
│             │ Dentro de límites                                  │
│  ┌──────────▼──────────┐                                        │
│  │ 3. evaluateRules()  │  ¿Las reglas de la promo se cumplen    │
│  │                     │  con este carrito/usuario?              │
│  │  (ALL → todas deben │  Usa los IRuleEvaluator por tipo       │
│  │   ANY → al menos 1) │                                        │
│  └──────────┬──────────┘                                        │
│             │ Pasan las reglas                                   │
│  ┌──────────▼──────────┐                                        │
│  │ 4. resolver         │  Ordena por prioridad (desc).          │
│  │    .resolve()       │  Filtra por stackable.                 │
│  │                     │  ¿Se pueden combinar?                  │
│  └──────────┬──────────┘                                        │
│             │ Promociones finales                                │
│  ┌──────────▼──────────┐                                        │
│  │ 5. applyActions()   │  Calcula descuentos con los            │
│  │                     │  IActionApplier por tipo.               │
│  │                     │  Descuentos se acumulan                 │
│  │                     │  secuencialmente sobre                  │
│  │                     │  el total restante.                     │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│         EngineResult { originalTotal, finalTotal,                │
│                        totalDiscount, appliedPromotions[] }      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Paso 1: Obtener Promociones Elegibles

**Archivo:** `promotion-engine.ts` → `getEligiblePromotions()`

Consulta la base de datos filtrando por:
- `deletedAt: null` (no eliminada)
- `isActive: true` (activa manualmente)
- `startsAt <= ahora` (ya comenzó)
- `endsAt > ahora` o `endsAt: null` (no expiró o no tiene fecha de fin)

**Con cupón:** trae la promo del cupón + todas las automáticas (sin cupón) para que puedan stackearse.

**Sin cupón:** solo trae promos automáticas (`couponCode: null`).

---

## Paso 2: Filtrar por Límites de Uso

**Archivo:** `promotion-engine.ts` → `filterByUsageLimits()`

Para cada promoción con `maxUsesPerUser != null`, cuenta cuántas veces el usuario la ha usado (tabla `PromotionUsage`). Si ya alcanzó el límite, la descarta.

Si `maxUsesPerUser === null`, la promo no tiene límite y siempre pasa.

---

## Paso 3: Evaluar Reglas

**Archivo:** `promotion-engine.ts` → `evaluateRules()`

Cada promoción tiene N reglas. Cada regla es evaluada por su evaluador específico del registry.

### Operador lógico entre reglas

Cada promoción define `ruleOperator`:

| Operador | Lógica | Significado |
|----------|--------|-------------|
| `ALL`    | AND    | **Todas** las reglas deben cumplirse |
| `ANY`    | OR     | **Al menos una** regla debe cumplirse |

Si la promo no tiene reglas, se considera que aplica automáticamente (sin condiciones).

### Cómo funciona la evaluación

```
Promoción "VIP 20% en Ropa" (ruleOperator: ALL)
├── Regla 1: CUSTOMER_ROLE EQUALS "VIP_LOVER"  → ¿true?
├── Regla 2: CATEGORY EQUALS "ROPA"             → ¿true?
└── Regla 3: CART_MIN_TOTAL GREATER_OR_EQUAL "100" → ¿true?

ALL → true AND true AND true = ✅ Aplica
```

### Los 7 Evaluadores de Reglas

Cada uno implementa `IRuleEvaluator<TRule>` con un solo método: `evaluate(rule, context): boolean`.

| Evaluador | Tipo de Regla | Qué Evalúa | Operadores |
|-----------|--------------|-------------|------------|
| `ProductRuleEvaluator` | `PRODUCT` | ¿Está un producto específico en el carrito? | EQUALS, NOT_EQUALS, IN, NOT_IN |
| `CategoryRuleEvaluator` | `CATEGORY` | ¿Hay items de cierta categoría? | EQUALS, NOT_EQUALS, IN, NOT_IN |
| `TagRuleEvaluator` | `TAG` | ¿Algún item tiene cierto tag? (case-insensitive) | EQUALS, NOT_EQUALS, IN, NOT_IN |
| `CartMinTotalEvaluator` | `CART_MIN_TOTAL` | ¿El total del carrito cumple un umbral? | EQUALS, GT, LT, GTE, LTE |
| `CartMinQuantityEvaluator` | `CART_MIN_QUANTITY` | ¿La cantidad total de items cumple un umbral? | EQUALS, GT, LT, GTE, LTE |
| `CustomerRoleEvaluator` | `CUSTOMER_ROLE` | ¿El nivel VIP del usuario coincide? | EQUALS, NOT_EQUALS, IN, NOT_IN |
| `FirstPurchaseEvaluator` | `FIRST_PURCHASE` | ¿Es la primera compra del usuario? | EQUALS (solo) |

> **Nota:** `isFirstPurchase` se pre-computa en el contexto antes de evaluar. Los evaluadores son **síncronos y puros** (no hacen queries a BD).

---

## Paso 4: Resolver Prioridad y Stacking

**Archivo:** `promotion-resolver.ts` → `PromotionResolver.resolve()`

Después de que las reglas filtran qué promos son válidas, el resolver decide **cuáles se aplican realmente** cuando hay conflictos.

### Algoritmo del Resolver

```
Input: [PromoA(p:100, stackable), PromoB(p:80, stackable), PromoC(p:50, no-stackable)]

1. Ordenar por prioridad DESC        → [PromoA(100), PromoB(80), PromoC(50)]

2. La primera SIEMPRE aplica          → result = [PromoA]

3. ¿PromoA es stackable?
   ├── NO  → return [PromoA]  (bloquea todo)
   └── SI  → continuar iterando

4. Para cada siguiente:
   ├── ¿Stackable?
   │   └── SI → agregarla al result  → result = [PromoA, PromoB]
   └── ¿No stackable?
       └── Agregarla + BREAK          → result = [PromoA, PromoB, PromoC]
           (bloquea las de menor prioridad)
```

### Tabla de decisión

| Promo Anterior | Promo Actual | Resultado |
|---------------|-------------|-----------|
| stackable: true | stackable: true | Se acumula |
| stackable: true | stackable: false | Se agrega pero bloquea las siguientes |
| stackable: false | (cualquiera) | No llega aquí (ya se retornó antes) |

### El tipo genérico `resolve<T>`

El resolver usa un genérico `<T extends PromotionLike>` para que pueda recibir promociones con relaciones extra (rules, actions) y devolverlas con el mismo tipo, sin perder información:

```typescript
type PromotionLike = Promotion & Record<string, unknown>;

resolve<T extends PromotionLike>(validPromotions: T[]): T[]
```

---

## Paso 5: Aplicar Acciones (Descuentos)

**Archivo:** `promotion-engine.ts` → `applyActions()`

Las acciones de cada promoción se aplican **secuencialmente sobre el total restante**. Si la promo A descuenta $40 de un carrito de $200, la promo B calcula su descuento sobre $160.

### Los 3 Aplicadores de Acciones

Cada uno implementa `IActionApplier<TAction>` con un solo método: `apply(action, context, currentTotal): number`.

#### 1. PercentageDiscountApplier (`PERCENTAGE_DISCOUNT`)

Calcula un porcentaje del total, producto, o item más barato.

```
Ejemplo: 20% de descuento en carrito de $300, maxDiscount: $50
→ descuento bruto = $300 × 0.20 = $60
→ con tope máximo = min($60, $50) = $50
```

El `target` determina la base del cálculo:
- `CART` → total actual del carrito
- `CHEAPEST_ITEM` → precio del item más barato
- `PRODUCT` → total actual (equivale a CART en este contexto)

#### 2. FixedDiscountApplier (`FIXED_DISCOUNT`)

Resta un monto fijo, sin exceder el total disponible.

```
Ejemplo: $50 de descuento en carrito de $30
→ descuento = min($50, $30) = $30  (no puede ser negativo)
```

#### 3. BuyXGetYApplier (`BUY_X_GET_Y`)

Implementa "compra X, lleva Y gratis".

```
Ejemplo: 2x1 (value: "2:1") con items de $100, $80, $50

1. Parsear "2:1" → buyCount=2, freeCount=1
2. Expandir items por cantidad → [$100, $80, $50]
3. Set size = 2+1 = 3. Sets completos = floor(3/3) = 1
4. Ordenar precios asc: [$50, $80, $100]
5. Los 1 items más baratos del set son gratis → $50
6. Descuento = $50
```

### Garantía de seguridad

Todos los aplicadores garantizan que:
- El descuento nunca es negativo (`Math.max(discount, 0)`)
- El descuento nunca excede el total actual (`Math.min(discount, currentTotal)`)
- Se redondea a 2 decimales (`Math.round(x * 100) / 100`)

---

## Sistema de Tipos Avanzado

El engine usa 4 patrones avanzados de TypeScript:

### 1. Discriminated Unions (Uniones Discriminadas)

Cada tipo de regla/acción es una interfaz con un campo `type` literal que actúa como discriminante:

```typescript
// TypeScript infiere automáticamente qué operadores son válidos
interface ProductRule {
  readonly type: 'PRODUCT';          // ← discriminante
  readonly operator: EqualityOperator; // EQUALS | NOT_EQUALS | IN | NOT_IN
  readonly value: string;
}

interface CartMinTotalRule {
  readonly type: 'CART_MIN_TOTAL';   // ← discriminante
  readonly operator: NumericOperator;  // GREATER_THAN | LESS_THAN | ...
  readonly value: string;
}
```

Previene combinaciones inválidas en **tiempo de compilación** (no en runtime).

### 2. Mapped Types (Tipos Mapeados)

El registry de evaluadores usa un mapped type para garantizar que existe un evaluador para CADA tipo de regla:

```typescript
type RuleEvaluatorRegistry = {
  [K in keyof RuleTypeMap]: IRuleEvaluator<RuleTypeMap[K]>;
};

// Si agregas un nuevo RuleType al enum de Prisma pero NO
// agregas su evaluador aquí, TypeScript da error de compilación.
```

### 3. Generic Interfaces (Interfaces Genéricas)

Las interfaces `IRuleEvaluator<TRule>` y `IActionApplier<TAction>` usan genéricos para que cada implementación solo reciba el tipo correcto de regla/acción:

```typescript
// ProductRuleEvaluator solo puede recibir ProductRule, nunca CartMinTotalRule
class ProductRuleEvaluator implements IRuleEvaluator<ProductRule> {
  evaluate(rule: ProductRule, context: PromotionContext): boolean { ... }
}
```

### 4. Conditional Types (Tipos Condicionales)

`ActionResult<T>` infiere automáticamente el tipo de resultado según la acción:

```typescript
type ActionResult<T extends TypedPromotionAction['type']> =
  T extends 'PERCENTAGE_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'FIXED_DISCOUNT' ? MonetaryDiscountResult :
  T extends 'BUY_X_GET_Y' ? FreeItemDiscountResult :
  never;

// TypeScript infiere el resultado correcto:
const r: ActionResult<'BUY_X_GET_Y'> = { discountAmount: 50, freeItems: 1 };
```

---

## Ejemplo Completo: Flujo Real

```
CONTEXTO:
  userId: "user-123"
  customerRole: "VIP_LOVER"
  cartItems: [
    { productId: "p1", category: "ROPA", tags: ["verano"], price: 150, qty: 1 },
    { productId: "p2", category: "ACCESORIOS", tags: ["casual"], price: 50, qty: 2 }
  ]
  cartTotal: 250
  couponCode: "VERANO20"
  isFirstPurchase: false

PASO 1 - Elegibles:
  → "VERANO20" (cupón, priority: 100, stackable: true)
  → "VIP Descuento" (automática, priority: 50, stackable: true)
  → "Flash Sale" (automática, priority: 30, stackable: false)

PASO 2 - Límites:
  → Las 3 pasan (ninguna tiene maxUsesPerUser o no se ha alcanzado)

PASO 3 - Reglas:
  "VERANO20": rules = [TAG EQUALS "verano"] → true (p1 tiene "verano")     ✅
  "VIP Descuento": rules = [CUSTOMER_ROLE IN "VIP_LOVER,VIP_LEGEND"] → true ✅
  "Flash Sale": rules = [CART_MIN_TOTAL GTE "500"] → false (250 < 500)      ❌

PASO 4 - Resolver:
  Input: ["VERANO20"(p:100, stack), "VIP Descuento"(p:50, stack)]
  → Ambas stackable → result = ["VERANO20", "VIP Descuento"]

PASO 5 - Acciones:
  "VERANO20": PERCENTAGE_DISCOUNT 20% CART, maxDiscount: null
    → 250 × 0.20 = $50.00    → currentTotal = 200
  "VIP Descuento": FIXED_DISCOUNT $15 CART
    → min(15, 200) = $15.00   → currentTotal = 185

RESULTADO:
  {
    originalTotal: 250.00,
    finalTotal: 185.00,
    totalDiscount: 65.00,
    appliedPromotions: [
      { promotionName: "VERANO20", discountAmount: 50.00, actionType: "PERCENTAGE_DISCOUNT" },
      { promotionName: "VIP Descuento", discountAmount: 15.00, actionType: "FIXED_DISCOUNT" }
    ]
  }
```

---

## Cosas a Tener en Cuenta

### Descuentos secuenciales, no paralelos
Los descuentos se aplican **en cascada sobre el total restante**. Si PromoA descuenta 20% de $100 ($20), PromoB calcula su porcentaje sobre los $80 restantes, no sobre los $100 originales.

### Tags son case-insensitive
El `TagRuleEvaluator` normaliza todo a minúsculas antes de comparar. "Verano", "VERANO", y "verano" son equivalentes.

### Valores como strings
Todos los `value` de reglas y acciones se guardan como `string` en BD. Los evaluadores/aplicadores los parsean internamente (`parseFloat`, `parseInt`, `split`, etc.).

### Promos sin reglas siempre aplican
Si una promoción no tiene reglas configuradas, pasa automáticamente al resolver. Esto permite crear promos universales (ej: "10% para todos").

### El resolver es genérico
Acepta `Promotion` con cualquier combinación de relaciones extra (rules, actions, etc.) y las devuelve con el mismo tipo, sin perder información.

---

## Cómo Agregar un Nuevo Tipo de Regla

1. Agregar el valor al enum `RuleType` en `prisma/schema.prisma`
2. Crear la interfaz tipada en `types/rule-types.ts`
3. Agregarla a `TypedPromotionRule` (union) y `RuleTypeMap` (mapped type)
4. Crear el archivo `engine/rule-evaluators/nuevo-tipo.evaluator.ts`
5. Exportar desde `engine/rule-evaluators/index.ts`
6. Registrar en `ruleEvaluators` del `PromotionEngine`

TypeScript dará error de compilación en el paso 6 si no se completan los pasos 2-5.

## Cómo Agregar un Nuevo Tipo de Acción

1. Agregar el valor al enum `ActionType` en `prisma/schema.prisma`
2. Crear la interfaz tipada en `types/action-types.ts`
3. Agregarla a `TypedPromotionAction` (union)
4. Crear el archivo `engine/action-appliers/nuevo-tipo.applier.ts`
5. Exportar desde `engine/action-appliers/index.ts`
6. Registrar en `actionAppliers` del `PromotionEngine`
