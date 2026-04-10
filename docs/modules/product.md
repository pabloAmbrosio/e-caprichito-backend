# Módulo — Product

## Customer Search Engine (`customer-search-engine/`)

Motor de búsqueda SQL raw diseñado exclusivamente para el **shop** (cliente final). Prioriza performance porque recibe el tráfico de todos los compradores.

### Por qué SQL raw y no Prisma ORM

El volumen de queries del shop justifica la complejidad del SQL raw. El backoffice (staff, pocos usuarios) no usa este engine — puede usar Prisma ORM sin problema de performance.

### Condiciones base hardcodeadas

`buildWhereConditions` inyecta siempre:

```sql
ap."deletedAt" IS NULL
ap.status = 'PUBLISHED'
```

Estas condiciones **no son configurables** a propósito. El engine está enfocado al cliente: solo debe ver productos publicados y no eliminados. Si backoffice necesita listar productos, debe usar un service/query separado.

### Estructura

| Carpeta | Responsabilidad |
|---------|----------------|
| `builders/` | Constructores SQL modulares (WHERE, ORDER BY, CTEs, aggregates, data query) |
| `helpers/` | Paginación (clamp) |
| `types/` | `WhereFilters` (solo filtrado), `ListProductsFilters` (extends WhereFilters + paginación/aggregates/contexto) |
| `constants/` | Statement timeout |
| `errors/` | Re-export de errores de sort inválido |

### Tipado de filtros

- **`WhereFilters`** — 8 campos de filtrado puro (category, title, tags, precio, fecha). Definido en `build-where-conditions.ts`. Es lo único que `buildWhereConditions` recibe.
- **`ListProductsFilters`** — extends `WhereFilters` + paginación (`sort`, `limit`, `offset`, `randomSeed`) + aggregates opcionales (`includeSales`, `includeLikes`) + contexto (`userId`). Es lo que recibe `executeSearch`.

La separación hace explícito qué consume cada builder.

### Filtrado por tags: operador `@>` de PostgreSQL

> **Nota de honestidad:** La decisión de filtrar por tags con semántica "contiene todos" fue del desarrollador. La sintaxis SQL con el operador `@>` y la construcción parametrizada con `sql`/`join` fue propuesta por Claude (IA).

El filtro de tags usa el operador `@>` (contains) de arrays de PostgreSQL. Esto exige que el producto tenga **todos** los tags pedidos, no solo alguno.

```typescript
// ['ropa', 'mujer'] → fragmentos SQL parametrizados (safe contra injection)
const safeTags = tags.map((t) => sql`${t}`);
// [sql'ropa', sql'mujer'] → sql'ropa','mujer'
const tagsList = join(safeTags, ',');
// @> = "contiene todos": el producto debe tener TODOS los tags pedidos
conditions.push(sql`ap.tags @> ARRAY[${tagsList}]::text[]`);
```

SQL resultante:
```sql
ap.tags @> ARRAY['ropa','mujer']::text[]
```

- Un producto con tags `['ropa', 'mujer', 'verano']` → **pasa** (contiene ambos)
- Un producto con tags `['ropa']` → **no pasa** (le falta `'mujer'`)

El `::text[]` castea explícitamente a array de texto para que PostgreSQL use el índice GIN si existe.

### Ensamblado de CTEs con `join` + `isNotEmpty`

Los CTEs del data query (categorías, breadcrumbs, sales, likes) son condicionales — algunos pueden ser `empty` según los filtros. Antes, cada CTE manejaba su propia coma (unos al principio, otros al final), lo que era frágil y confuso.

Ahora cada builder devuelve su CTE **sin coma**, se agrupan en un array, se filtran los vacíos con `isNotEmpty` (helper en `lib/prisma/sql.ts`, diseñado como callback estilo `Boolean` para `.filter()`), y se unen con `join`:

```typescript
const ctes = [
  categoryDescendantsCte,
  usedCategoriesCte,
  pathRowsCte,
  pathAggCte,
  salesCte,
  likesCte,
].filter(isNotEmpty);

sql`WITH RECURSIVE ${join(ctes, ',')} SELECT ...`;
```

Si `salesCte` y `likesCte` son `empty`, quedan fuera del array. Sin comas huérfanas, sin condicionales manuales.

### Fragmentación del data query

El query principal (`buildDataSql`) estaba monolítico — CTEs, JOINs, SELECT y GROUP BY mezclados en un solo template SQL de 100+ líneas. Se fragmentó en dos archivos:

- **`data-sql-fragments.ts`** — fragmentos SQL estáticos con nombres descriptivos y comentarios sobre qué hace cada uno:
  - CTEs fijos: `usedCategoriesCte`, `pathRowsCte`, `pathAggCte`
  - JOINs fijos: `breadcrumbJoin`, `categoryJoin`, `variantsJoin`, `inventoryJoin`
  - SELECT base: `baseSelect` (campos del abstract product + stock + variantes como JSON)
  - GROUP BY base: `baseGroupBy`

- **`build-data-sql.ts`** — solo ensambla piezas. Agrupa fragmentos condicionales en arrays, filtra vacíos, y une con helpers semánticos:

```typescript
return sql`
  ${withRecursive(ctes)}
  SELECT
    ${baseSelect}
    ${joinAll(extraSelects)}
  FROM "AbstractProduct" ap
  ${joinAll(joins)}
  ${where}
  ${baseGroupBy} ${joinAll(extraGroupBys)}
  ${orderBy}
  ${pagination}
`;
```

El builder se lee como pseudocódigo. Los detalles SQL viven en los fragmentos.

### Validación

Toda la validación de filtros vive en el schema Valibot (`list-products.schema.ts`), no en el engine. El engine asume datos ya validados. Esto incluye la regla cross-field: `randomSeed` requiere `sort` con `field: 'random'`.
