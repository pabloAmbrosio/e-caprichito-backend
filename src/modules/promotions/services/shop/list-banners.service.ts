/**
 * Servicio público para listar banners de promociones activas.
 * Clasifica promos en 3 grupos: product, cart, coupons.
 */
import { db } from '../../../../lib/prisma';
import type { BannersResponse, ProductBanner, CartBanner, CouponBanner } from '../../types/banner-types';
import {
  isDisplayablePromotion,
  extractFilters,
  extractRequiredRole,
  isFirstPurchaseOnly,
  getDisplayableAction,
} from '../../helpers/classify-promotion';

/**
 * Lista promociones activas clasificadas por naturaleza.
 *
 * 1. Trae todas las activas con rules + actions (1 sola query)
 * 2. Clasifica: coupon → product → cart
 * 3. Mapea a los shapes del response
 */
export const listBannersService = async () => {
  const now = new Date();

  const promotions = await db.promotion.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
    include: { rules: true, actions: true },
    orderBy: { priority: 'desc' },
  });

  const product: ProductBanner[] = [];
  const cart: CartBanner[] = [];
  const coupons: CouponBanner[] = [];

  for (const promo of promotions) {
    const base = {
      id: promo.id,
      name: promo.name,
      description: promo.description,
      imageUrl: promo.imageUrl,
      badgeText: promo.badgeText,
      badgeColor: promo.badgeColor,
      colorPrimary: promo.colorPrimary,
      colorSecondary: promo.colorSecondary,
      endsAt: promo.endsAt,
    };

    // 1. Cupones van a su propio grupo
    if (promo.couponCode) {
      coupons.push({ ...base, couponCode: promo.couponCode });
      continue;
    }

    // 2. Promos displayables van a product
    if (isDisplayablePromotion(promo)) {
      const action = getDisplayableAction(promo.actions);
      if (action) {
        product.push({
          ...base,
          requiredRole: extractRequiredRole(promo.rules),
          isFirstPurchaseOnly: isFirstPurchaseOnly(promo.rules),
          action: {
            type: action.type as 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y',
            value: action.value,
          },
          filters: extractFilters(promo.rules),
        });
        continue;
      }
    }

    // 3. Resto va a cart
    cart.push(base);
  }

  const data: BannersResponse = { product, cart, coupons };
  return { msg: 'Banners obtenidos', data };
};
