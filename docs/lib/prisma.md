# Lib — Prisma

## Estructura

- `client.ts` — Pool PG, adapter, singleton, exporta `db` + tipos (`DbClient`, `TransactionClient`, `DbClientOrTx`)
- `soft-delete.ts` — Extensión `$extends` que auto-filtra queries según el modelo
- `sql.ts` — Wrapper sobre las utilidades SQL de Prisma (`sql`, `join`, `empty`, `Sql`)

## SQL Wrapper (`sql.ts`)

Los módulos **nunca deben importar `Prisma` directamente** desde `generated/prisma/client` para construir SQL. En su lugar, importan de `lib/prisma`:

```typescript
// Bien
import { sql, join, empty, type Sql } from '../../../../lib/prisma';

// Mal
import { Prisma } from '../../../../generated/prisma/client';
```

| Export | Reemplaza | Uso |
|--------|-----------|-----|
| `sql` | `Prisma.sql` | Tagged template para fragmentos SQL parametrizados |
| `join` | `Prisma.join` | Unir fragmentos SQL con un separador |
| `empty` | `Prisma.empty` | Fragmento vacío para condicionales |
| `Sql` | `Prisma.Sql` | Tipo TypeScript para fragmentos SQL |

Esto centraliza la dependencia del cliente generado en `lib/` y mantiene los módulos desacoplados.

## Auto-filter por modelo

| Modelo | Campo | Comportamiento por defecto | Bypass |
|--------|-------|---------------------------|--------|
| `User` | `deletedAt` | Filtra `deletedAt: null` | Pasar `deletedAt` explícito en where |
| `Address` | `deletedAt` | Filtra `deletedAt: null` | Pasar `deletedAt` explícito en where |
| `Category` | `isActive` | Filtra `isActive: true` | Pasar `isActive: undefined` en where |

Hooks aplicados: `findFirst`, `findMany`, `findUnique`. No afecta `create`, `update`, `delete` ni `$queryRaw`.

## Bypass de Category: el truco del operador `in`

> **Nota de honestidad:** El problema fue identificado por el desarrollador (las categorías inactivas debían filtrarse automáticamente, pero backoffice necesitaba verlas). La solución del bypass con el operador `in` de JS fue propuesta por Claude (IA). Crédito donde corresponde.

### El problema

Category usa un boolean (`isActive`) en vez de un nullable (`deletedAt`). Con `deletedAt`, el bypass es natural: si pasas cualquier valor truthy, el check `!args.where?.deletedAt` da `false` y el auto-filter no se activa. Pero con un boolean no hay un valor "neutral" que signifique "dame todo" — `true` filtra activas, `false` filtra inactivas.

### La solución

Se usa el operador `in` de JavaScript en vez de `=== undefined` para el check:

```typescript
// El auto-filter checa si la KEY existe, no su valor
if (!('isActive' in (args.where || {}))) {
  args.where = { ...args.where, isActive: true };
}
```

Para bypass, el caller pasa `{ isActive: undefined }`:

```typescript
// Backoffice: quiere ver activas e inactivas
db.category.findMany({ where: { isActive: undefined } })
```

### Por qué funciona

Dos comportamientos distintos se combinan:

1. **JS `in` operator**: detecta que la key `isActive` **existe** en el objeto, aunque su valor sea `undefined`. El auto-filter ve la key y no inyecta `isActive: true`.

2. **Prisma**: ignora keys con valor `undefined` en el `where`. No genera `WHERE "isActive" = ...` en el SQL.

| Escenario | `'isActive' in where` | Auto-filter | Prisma WHERE | Resultado |
|-----------|:---------------------:|:-----------:|:------------:|:---------:|
| `{}` (shop, default) | `false` | Inyecta `true` | `"isActive" = true` | Solo activas |
| `{ isActive: true }` | `true` | No toca | `"isActive" = true` | Solo activas |
| `{ isActive: false }` | `true` | No toca | `"isActive" = false` | Solo inactivas |
| `{ isActive: undefined }` | `true` | No toca | *(nada)* | **Todas** |

### Cascadeo de desactivación

`deactivateCategory` usa un CTE recursivo que desactiva la categoría target y todos sus descendientes en un solo query SQL. Así el auto-filter es consistente: si un padre está inactivo, sus hijos también lo están.

## TODO: Soft-delete incompleto

Solo `User` y `Address` tienen auto-filter de `deletedAt`. Faltan 4 modelos que tienen `deletedAt` en el schema de Prisma:

- `AbstractProduct`
- `Product`
- `Cart`
- `Promotion`

Evaluar cuáles necesitan auto-filter y cuáles se filtran manualmente a propósito (ej: el search engine de productos puede tener su propia lógica).
