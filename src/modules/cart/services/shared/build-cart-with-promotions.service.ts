import { evaluateCartPromotions } from "../../adapters/promotion.adapter";
import { mapCartToCustomerService } from "./map-cart-to-customer.service";
import { mapCartItemsForEngine, calculateSubtotalInCents } from "../../helpers/cart";
import type { Cart } from "../../types/cart.types";

export const buildCartWithPromotions = async (
    cart: Cart,
    userId: string,
    customerRole?: string | null,
) => {
    if (cart.items.length === 0) {
        return mapCartToCustomerService(cart, null);
    }

    const cartItems = mapCartItemsForEngine(cart.items);
    const cartTotalInCents = calculateSubtotalInCents(cartItems);

    const promotionResult = await evaluateCartPromotions({
        userId,
        customerRole : customerRole ?? null,
        cartItems,
        cartTotalInCents,
        couponCode: cart.couponCode ?? undefined,
    });

    return mapCartToCustomerService(cart, promotionResult);
};
