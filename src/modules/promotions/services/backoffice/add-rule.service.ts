/**
 * Servicio para agregar una regla a una promoción existente.
 * Valida que la promoción exista y no esté eliminada.
 *
 * #11 [ALTO]: La validación y creación se ejecutan dentro de una transacción
 * Prisma para garantizar atomicidad (la promoción no puede ser eliminada
 * entre la validación y la creación de la regla).
 */
import { db } from '../../../../lib/prisma';
import { PromotionNotFoundError } from '../../errors';
import type { CreateRuleInput } from '../../schemas';
import type { RuleType, ComparisonOperator } from '../../../../lib/prisma';

/**
 * Agrega una nueva PromotionRule a una promoción.
 *
 * #11 [ALTO]: La validación de existencia y la creación de la regla se ejecutan
 * dentro de una transacción para prevenir race conditions.
 *
 * @param promotionId - ID de la promoción a la que se agrega la regla
 * @param data - Datos de la regla (type, operator, value) validados por Valibot
 * @returns La regla creada
 * @throws Error si la promoción no existe o fue eliminada
 */
export const addRuleService = async (promotionId: string, data: CreateRuleInput) => {
  return db.$transaction(async (tx) => {
    /** Verificar que la promoción existe y no fue eliminada (dentro de la transacción) */
    const promotion = await tx.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion || promotion.deletedAt) {
      throw new PromotionNotFoundError();
    }

    /** Crear la regla asociada a la promoción */
    const rule = await tx.promotionRule.create({
      data: {
        promotionId,
        type: data.type as RuleType,
        operator: data.operator as ComparisonOperator,
        value: data.value,
      },
    });

    return { msg: "Regla agregada", data: rule };
  });
};
