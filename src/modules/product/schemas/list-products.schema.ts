import * as v from 'valibot';
import { coerceBoolean, coerceInteger, coerceNumber, coerceStringArray, coerceSortArray } from '../../shared/schemas/coerce';

const SortableFieldSchema = v.picklist(
  ['category', 'title', 'createdAt', 'random', 'price', 'sales', 'likes'],
  'El campo de ordenamiento debe ser "category", "title", "createdAt", "random", "price", "sales" o "likes"'
);

const SortDirectionSchema = v.picklist(
  ['asc', 'desc'],
  'La dirección debe ser "asc" o "desc"'
);

const SortFieldSchema = v.strictObject({
  field: SortableFieldSchema,
  direction: SortDirectionSchema,
});

export const ListProductsSchema = v.pipe(
  v.object({
    categoryIds: v.optional(
      v.pipe(
        coerceStringArray,
        v.array(
          v.pipe(
            v.string('Cada categoryId debe ser texto'),
            v.uuid('Cada categoryId debe ser un UUID válido')
          ),
          'categoryIds debe ser un arreglo'
        ),
        v.maxLength(50, 'No se pueden filtrar más de 50 categorías a la vez')
      )
    ),

    title: v.optional(
      v.pipe(
        v.string('El título debe ser texto'),
        v.minLength(1, 'El título no puede estar vacío'),
        v.maxLength(200, 'El título no puede exceder 200 caracteres')
      )
    ),

    tags: v.optional(
      v.pipe(
        coerceStringArray,
        v.array(
          v.pipe(
            v.string('Cada tag debe ser texto'),
            v.minLength(1, 'El tag no puede estar vacío'),
            v.maxLength(100, 'Cada tag no puede exceder 100 caracteres')
          ),
          'Los tags deben ser un arreglo'
        ),
        v.maxLength(20, 'No se pueden filtrar más de 20 tags a la vez')
      )
    ),

    isFeatured: v.optional(
      v.pipe(coerceBoolean, v.boolean('isFeatured debe ser un booleano'))
    ),

    minPriceInCents: v.optional(
      v.pipe(
        coerceInteger,
        v.number('El precio mínimo debe ser un número'),
        v.integer('El precio mínimo debe ser un entero'),
        v.minValue(0, 'El precio mínimo no puede ser negativo'),
        v.maxValue(100_000_000, 'El precio mínimo excede el máximo permitido')
      )
    ),

    maxPriceInCents: v.optional(
      v.pipe(
        coerceInteger,
        v.number('El precio máximo debe ser un número'),
        v.integer('El precio máximo debe ser un entero'),
        v.minValue(0, 'El precio máximo no puede ser negativo'),
        v.maxValue(100_000_000, 'El precio máximo excede el máximo permitido')
      )
    ),

    createdFrom: v.optional(
      v.pipe(
        v.string('createdFrom debe ser texto'),
        v.isoTimestamp('createdFrom debe ser una fecha ISO válida'),
        v.transform((s) => new Date(s))
      )
    ),

    createdTo: v.optional(
      v.pipe(
        v.string('createdTo debe ser texto'),
        v.isoTimestamp('createdTo debe ser una fecha ISO válida'),
        v.transform((s) => new Date(s))
      )
    ),

    sort: v.optional(
      v.pipe(
        coerceSortArray,
        v.array(SortFieldSchema, 'sort debe ser un arreglo'),
        v.maxLength(3, 'No se pueden usar más de 3 criterios de ordenamiento')
      )
    ),

    limit: v.optional(
      v.pipe(
        coerceInteger,
        v.number('El límite debe ser un número'),
        v.integer('El límite debe ser un entero'),
        v.minValue(1, 'El límite debe ser al menos 1'),
        v.maxValue(100, 'El límite no puede exceder 100')
      )
    ),

    offset: v.optional(
      v.pipe(
        coerceInteger,
        v.number('El offset debe ser un número'),
        v.integer('El offset debe ser un entero'),
        v.minValue(0, 'El offset no puede ser negativo'),
        v.maxValue(10_000, 'El offset no puede exceder 10,000')
      )
    ),

    randomSeed: v.optional(
      v.pipe(
        coerceNumber,
        v.number('El seed debe ser un número'),
        v.minValue(0, 'El seed debe ser entre 0 y 1'),
        v.maxValue(1, 'El seed debe ser entre 0 y 1')
      )
    ),

    includeSales: v.optional(
      v.pipe(coerceBoolean, v.boolean('includeSales debe ser un booleano'))
    ),

    includeLikes: v.optional(
      v.pipe(coerceBoolean, v.boolean('includeLikes debe ser un booleano'))
    ),
  }),
  v.check(
    (data) =>
      data.minPriceInCents === undefined ||
      data.maxPriceInCents === undefined ||
      data.minPriceInCents <= data.maxPriceInCents,
    'El precio mínimo no puede ser mayor al máximo'
  ),

  v.check(
    (data) =>
      data.createdFrom === undefined ||
      data.createdTo === undefined ||
      data.createdFrom <= data.createdTo,
    'createdFrom no puede ser posterior a createdTo'
  ),

  v.check(
    (data) =>
      data.randomSeed === undefined ||
      data.sort?.some((s) => s.field === 'random') === true,
    'randomSeed requiere que sort incluya { field: "random" }'
  )
);

export type ListProductsInput = v.InferOutput<typeof ListProductsSchema>;