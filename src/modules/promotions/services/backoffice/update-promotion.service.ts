/**
 * Servicio para actualizar una promoción existente.
 * Valida existencia, soft delete, y unicidad del couponCode si cambió.
 */
import { db } from '../../../../lib/prisma';
import { PromotionNotFoundError, PromotionAlreadyDeletedError, CouponAlreadyExistsError } from '../../errors';
import { promotionWithRulesAndActionsInclude } from '../../promotion.selects';
import type { UpdatePromotionInput } from '../../schemas';
import type { RuleOperator } from '../../../../lib/prisma';

/**
 * Actualiza los campos de una promoción existente (PATCH parcial).
 *
 * @param id - ID de la promoción a actualizar
 * @param data - Campos a actualizar (solo los que se enviaron)
 * @returns La promoción actualizada con rules y actions
 * @throws Error si la promoción no existe o fue eliminada
 * @throws Error si el nuevo couponCode ya está en uso por otra promoción
 */
export const updatePromotionService = async (id: string, data: UpdatePromotionInput) => {
  /** Verificar que la promoción existe y no fue eliminada */
  const existing = await db.promotion.findUnique({ where: { id } });

  if (!existing) {
    throw new PromotionNotFoundError();
  }

  if (existing.deletedAt) {
    throw new PromotionAlreadyDeletedError();
  }

  /** Validar unicidad del couponCode si se está cambiando */
  if (data.couponCode !== undefined && data.couponCode !== null && data.couponCode !== existing.couponCode) {
    const duplicate = await db.promotion.findUnique({
      where: { couponCode: data.couponCode },
    });

    if (duplicate) {
      throw new CouponAlreadyExistsError();
    }
  }

  /** Construir objeto de actualización solo con los campos enviados */
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.couponCode !== undefined) updateData.couponCode = data.couponCode;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.stackable !== undefined) updateData.stackable = data.stackable;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
  if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser;
  if (data.ruleOperator !== undefined) updateData.ruleOperator = data.ruleOperator as RuleOperator;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.colorPrimary !== undefined) updateData.colorPrimary = data.colorPrimary;
  if (data.colorSecondary !== undefined) updateData.colorSecondary = data.colorSecondary;
  if (data.badgeText !== undefined) updateData.badgeText = data.badgeText;
  if (data.badgeColor !== undefined) updateData.badgeColor = data.badgeColor;

  /** Actualizar en la base de datos */
  const promotion = await db.promotion.update({
    where: { id },
    data: updateData,
    include: promotionWithRulesAndActionsInclude,
  });

  return { msg: "Promocion actualizada", data: promotion };
};
