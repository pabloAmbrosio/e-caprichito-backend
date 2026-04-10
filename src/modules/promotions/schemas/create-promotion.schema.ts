/**
 * Schema de validación para crear una nueva promoción.
 * Valida los campos del body de la petición POST /promotions.
 *
 * #20 [ALTO]: Incluye validación custom para garantizar que endsAt > startsAt
 * cuando ambas fechas están presentes.
 *
 * #25 [BAJO]: Se permite startsAt en el futuro de forma intencional para
 * soportar promociones programadas (scheduled promotions).
 */
import * as v from 'valibot';
import { RULE_OPERATORS } from '../constants';

/** Schema de validación para el body de crear promoción */
export const CreatePromotionSchema = v.pipe(
  v.object({
    /** Nombre descriptivo de la promoción (ej: "Black Friday 20%") */
    name: v.pipe(
      v.string('El nombre debe ser texto'),
      v.nonEmpty('El nombre es requerido'),
      v.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      v.maxLength(200, 'El nombre no puede tener más de 200 caracteres')
    ),

    /** Descripción opcional con más detalle sobre la promoción */
    description: v.optional(
      v.pipe(
        v.string('La descripción debe ser texto'),
        v.maxLength(2000, 'La descripción no puede tener más de 2000 caracteres')
      )
    ),

    /** Código de cupón opcional (null = promoción automática) */
    couponCode: v.optional(
      v.pipe(
        v.string('El código de cupón debe ser texto'),
        v.nonEmpty('El código de cupón no puede estar vacío'),
        v.minLength(3, 'El código de cupón debe tener al menos 3 caracteres'),
        v.maxLength(50, 'El código de cupón no puede tener más de 50 caracteres')
      )
    ),

    /** Prioridad numérica (mayor = se evalúa primero). Default: 0 */
    priority: v.optional(
      v.pipe(
        v.number('La prioridad debe ser un número'),
        v.minValue(0, 'La prioridad no puede ser negativa'),
        v.maxValue(9999, 'La prioridad no puede ser mayor a 9999')
      )
    ),

    /** Si puede combinarse con otras promociones. Default: false */
    stackable: v.optional(
      v.boolean('El campo stackable debe ser verdadero o falso')
    ),

    /** Si la promoción está activa. Default: true */
    isActive: v.optional(
      v.boolean('El campo isActive debe ser verdadero o falso')
    ),

    /**
     * Fecha de inicio de vigencia en formato ISO 8601 (requerida).
     *
     * #25 [BAJO]: Se permite startsAt en el futuro intencionalmente para
     * soportar promociones programadas (scheduled promotions). Esto permite
     * a los administradores configurar promociones con antelación que se
     * activarán automáticamente en la fecha indicada.
     */
    startsAt: v.pipe(
      v.string('La fecha de inicio debe ser texto en formato ISO'),
      v.nonEmpty('La fecha de inicio es requerida'),
      v.isoTimestamp('La fecha de inicio debe ser un timestamp ISO válido')
    ),

    /** Fecha de fin de vigencia en formato ISO 8601 (opcional, null = sin expiración) */
    endsAt: v.optional(
      v.pipe(
        v.string('La fecha de fin debe ser texto en formato ISO'),
        v.isoTimestamp('La fecha de fin debe ser un timestamp ISO válido')
      )
    ),

    /** Límite de usos por usuario (opcional, null = ilimitado) */
    maxUsesPerUser: v.optional(
      v.pipe(
        v.number('El límite de usos debe ser un número'),
        v.minValue(1, 'El límite de usos debe ser al menos 1'),
        v.maxValue(99999, 'El límite de usos no puede ser mayor a 99999')
      )
    ),

    /** Operador lógico para las reglas: ALL (todas deben cumplirse) o ANY (al menos una) */
    ruleOperator: v.optional(
      v.pipe(
        v.string('El operador de reglas debe ser texto'),
        v.picklist(RULE_OPERATORS, 'Operador de reglas inválido. Valores permitidos: ALL, ANY')
      )
    ),

    // ─── DISPLAY / BANNER ─────────────────────

    /** URL de la imagen del banner/card */
    imageUrl: v.optional(
      v.pipe(
        v.string('La URL de imagen debe ser texto'),
        v.url('La URL de imagen debe ser una URL válida'),
        v.maxLength(2048, 'La URL de imagen no puede tener más de 2048 caracteres')
      )
    ),

    /** Color primario en formato CSS (ej: "#FF5733" o "brand-red") */
    colorPrimary: v.optional(
      v.pipe(
        v.string('El color primario debe ser texto'),
        v.maxLength(50, 'El color primario no puede tener más de 50 caracteres')
      )
    ),

    /** Color secundario para gradientes o fondos */
    colorSecondary: v.optional(
      v.pipe(
        v.string('El color secundario debe ser texto'),
        v.maxLength(50, 'El color secundario no puede tener más de 50 caracteres')
      )
    ),

    /** Texto corto del badge (ej: "2x1", "ENVÍO GRATIS", "HOT") */
    badgeText: v.optional(
      v.pipe(
        v.string('El texto del badge debe ser texto'),
        v.maxLength(30, 'El texto del badge no puede tener más de 30 caracteres')
      )
    ),

    /** Color del badge si difiere del primario */
    badgeColor: v.optional(
      v.pipe(
        v.string('El color del badge debe ser texto'),
        v.maxLength(50, 'El color del badge no puede tener más de 50 caracteres')
      )
    ),
  }),
  /**
   * #20 [ALTO]: Validación custom para garantizar que la fecha de fin
   * sea posterior a la fecha de inicio cuando ambas están presentes.
   * Previene la creación de promociones con rangos de fecha inválidos.
   */
  v.check((input) => {
    if (input.endsAt && input.startsAt) {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      return endsAt > startsAt;
    }
    return true;
  }, 'La fecha de fin (endsAt) debe ser posterior a la fecha de inicio (startsAt)')
);

/** Tipo inferido del schema de creación de promoción */
export type CreatePromotionInput = v.InferInput<typeof CreatePromotionSchema>;
