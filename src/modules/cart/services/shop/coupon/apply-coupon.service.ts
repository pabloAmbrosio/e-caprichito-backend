import { buildCartWithPromotions } from "../../shared";
import { getActiveCartService } from "../cart/get-active-cart.service";
import { applyCouponToCart } from "../../../helpers/coupon";


interface ApplyCouponResult {
  message: string;
  data: Awaited<ReturnType<typeof buildCartWithPromotions>> | null;
}

export async function applyCouponService(
  userId: string,
  customerRole: string | null,
  couponCode: string,
): Promise<ApplyCouponResult> {
  await applyCouponToCart(userId, couponCode);

  const { data: updatedCart } = await getActiveCartService(userId);
  const data = updatedCart
    ? await buildCartWithPromotions(updatedCart, userId, customerRole)
    : null;

  return { message: "Cupón aplicado al carrito", data };
}
