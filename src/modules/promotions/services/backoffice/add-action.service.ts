/**
 * Servicio para agregar una acción de descuento a una promoción existente.
 * Valida que la promoción exista y no esté eliminada dentro de una transacción.
 */
import { db } from '../../../../lib/prisma';
import { PromotionNotFoundError } from '../../errors';
import type { CreateActionInput } from '../../schemas';
import type { ActionType, ActionTarget } from '../../../../lib/prisma';

export const addActionService = async (promotionId: string, data: CreateActionInput) => {
  return db.$transaction(async (tx) => {
    const promotion = await tx.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion || promotion.deletedAt) {
      throw new PromotionNotFoundError();
    }

    const action = await tx.promotionAction.create({
      data: {
        promotionId,
        type: data.type as ActionType,
        value: data.value,
        maxDiscountInCents: data.maxDiscountInCents ?? null,
        target: data.target as ActionTarget,
      },
    });

    return { msg: "Accion agregada", data: action };
  });
};
