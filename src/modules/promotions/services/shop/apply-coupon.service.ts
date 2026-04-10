import { db } from '../../../../lib/prisma';
import { validateCouponService } from './validate-coupon.service';
import { applyPromotionsService } from './apply-promotions.service';
import { getActiveCart, mapCartItemsForEngine, calculateCartTotal } from '../../helpers';

export const applyCouponService = async (couponCode: string, userId: string, customerRole: string | null) => {
    const result = await db.$transaction(async (tx) => {
        await validateCouponService(couponCode, userId, tx);

        const cart = await getActiveCart(tx, userId);
        const cartItems = mapCartItemsForEngine(cart.items);
        const cartTotalInCents = calculateCartTotal(cartItems);

        return applyPromotionsService({
            userId,
            customerRole,
            cartItems,
            cartTotalInCents,
            couponCode,
        });
    });

    return { msg: "Cupon aplicado exitosamente", data: result };
};
