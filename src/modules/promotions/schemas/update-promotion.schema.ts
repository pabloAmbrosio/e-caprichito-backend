/**
 * Schema de validación para actualizar una promoción existente.
 * Todos los campos son opcionales (PATCH parcial).
 */
import * as v from 'valibot';
import { RULE_OPERATORS } from '../constants';

/** Schema de validación para el body de actualizar promoción (todos los campos opcionales) */
export const UpdatePromotionSchema = v.object({
  /** Nombre descriptivo de la promoción */
  name: v.optional(
    v.pipe(
      v.string('El nombre debe ser texto'),
      v.nonEmpty('El nombre no puede estar vacío'),
      v.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      v.maxLength(200, 'El nombre no puede tener más de 200 caracteres')
    )
  ),

  /** Descripción opcional */
  description: v.optional(
    v.nullable(
      v.pipe(
        v.string('La descripción debe ser texto'),
        v.maxLength(2000, 'La descripción no puede tener más de 2000 caracteres')
      )
    )
  ),

  /** Código de cupón (puede ser null para hacerla automática) */
  couponCode: v.optional(
    v.nullable(
      v.pipe(
        v.string('El código de cupón debe ser texto'),
        v.minLength(3, 'El código de cupón debe tener al menos 3 caracteres'),
        v.maxLength(50, 'El código de cupón no puede tener más de 50 caracteres')
      )
    )
  ),

  /** Prioridad numérica */
  priority: v.optional(
    v.pipe(
      v.number('La prioridad debe ser un número'),
      v.minValue(0, 'La prioridad no puede ser negativa'),
      v.maxValue(9999, 'La prioridad no puede ser mayor a 9999')
    )
  ),

  /** Si puede combinarse con otras promociones */
  stackable: v.optional(
    v.boolean('El campo stackable debe ser verdadero o falso')
  ),

  /** Si la promoción está activa */
  isActive: v.optional(
    v.boolean('El campo isActive debe ser verdadero o falso')
  ),

  /** Fecha de inicio de vigencia */
  startsAt: v.optional(
    v.pipe(
      v.string('La fecha de inicio debe ser texto en formato ISO'),
      v.isoTimestamp('La fecha de inicio debe ser un timestamp ISO válido')
    )
  ),

  /** Fecha de fin de vigencia (puede ser null para quitar expiración) */
  endsAt: v.optional(
    v.nullable(
      v.pipe(
        v.string('La fecha de fin debe ser texto en formato ISO'),
        v.isoTimestamp('La fecha de fin debe ser un timestamp ISO válido')
      )
    )
  ),

  /** Límite de usos por usuario (puede ser null para quitar límite) */
  maxUsesPerUser: v.optional(
    v.nullable(
      v.pipe(
        v.number('El límite de usos debe ser un número'),
        v.minValue(1, 'El límite de usos debe ser al menos 1'),
        v.maxValue(99999, 'El límite de usos no puede ser mayor a 99999')
      )
    )
  ),

  /** Operador lógico para las reglas */
  ruleOperator: v.optional(
    v.pipe(
      v.string('El operador de reglas debe ser texto'),
      v.picklist(RULE_OPERATORS, 'Operador de reglas inválido. Valores permitidos: ALL, ANY')
    )
  ),

  // ─── DISPLAY / BANNER ─────────────────────

  /** URL de la imagen del banner/card (null para borrar) */
  imageUrl: v.optional(
    v.nullable(
      v.pipe(
        v.string('La URL de imagen debe ser texto'),
        v.url('La URL de imagen debe ser una URL válida'),
        v.maxLength(2048, 'La URL de imagen no puede tener más de 2048 caracteres')
      )
    )
  ),

  /** Color primario (null para borrar) */
  colorPrimary: v.optional(
    v.nullable(
      v.pipe(
        v.string('El color primario debe ser texto'),
        v.maxLength(50, 'El color primario no puede tener más de 50 caracteres')
      )
    )
  ),

  /** Color secundario (null para borrar) */
  colorSecondary: v.optional(
    v.nullable(
      v.pipe(
        v.string('El color secundario debe ser texto'),
        v.maxLength(50, 'El color secundario no puede tener más de 50 caracteres')
      )
    )
  ),

  /** Texto del badge (null para borrar) */
  badgeText: v.optional(
    v.nullable(
      v.pipe(
        v.string('El texto del badge debe ser texto'),
        v.maxLength(30, 'El texto del badge no puede tener más de 30 caracteres')
      )
    )
  ),

  /** Color del badge (null para borrar) */
  badgeColor: v.optional(
    v.nullable(
      v.pipe(
        v.string('El color del badge debe ser texto'),
        v.maxLength(50, 'El color del badge no puede tener más de 50 caracteres')
      )
    )
  ),
});

/** Tipo inferido del schema de actualización de promoción */
export type UpdatePromotionInput = v.InferInput<typeof UpdatePromotionSchema>;
