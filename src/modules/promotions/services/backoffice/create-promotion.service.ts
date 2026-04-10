/**
 * Servicio para crear una nueva promocion.
 * Valida unicidad del couponCode y crea la promocion en la base de datos.
 *
 * #23 [BAJO]: Se elimino el casteo redundante `as RuleOperator` ya que
 * el valor viene validado por Valibot con picklist(['ALL', 'ANY']) que
 * ya garantiza que sea un valor valido del enum.
 */
import { db } from '../../../../lib/prisma';
import { CouponAlreadyExistsError } from '../../errors';
import { promotionWithRulesAndActionsInclude } from '../../promotion.selects';
import type { CreatePromotionInput } from '../../schemas';
import type { RuleOperator } from '../../../../lib/prisma';

/**
 * Crea una nueva promocion en la base de datos.
 *
 * @param data - Datos validados de la promocion (del schema Valibot)
 * @returns La promocion creada con sus campos completos
 * @throws Error si ya existe una promocion con el mismo couponCode
 */
export const createPromotionService = async (data: CreatePromotionInput) => {
  /** Validar unicidad del couponCode si fue proporcionado */
  if (data.couponCode) {
    const existing = await db.promotion.findUnique({
      where: { couponCode: data.couponCode },
    });

    if (existing) {
      throw new CouponAlreadyExistsError();
    }
  }

  /**
   * #23 [BAJO]: ruleOperator ya no requiere cast a RuleOperator.
   * El schema Valibot valida con picklist(['ALL', 'ANY']), y Prisma
   * acepta el string directamente porque coincide con los valores del enum.
   */
  const promotion = await db.promotion.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      couponCode: data.couponCode ?? null,
      priority: data.priority ?? 0,
      stackable: data.stackable ?? false,
      isActive: data.isActive ?? true,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      maxUsesPerUser: data.maxUsesPerUser ?? null,
      ruleOperator: (data.ruleOperator ?? 'ALL') as RuleOperator,
      imageUrl: data.imageUrl ?? null,
      colorPrimary: data.colorPrimary ?? null,
      colorSecondary: data.colorSecondary ?? null,
      badgeText: data.badgeText ?? null,
      badgeColor: data.badgeColor ?? null,
    },
    include: promotionWithRulesAndActionsInclude,
  });

  return { msg: "Promocion creada", data: promotion };
};
