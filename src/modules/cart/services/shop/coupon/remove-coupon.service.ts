import { buildCartWithPromotions } from "../../shared";
import { getActiveCartService } from "../cart/get-active-cart.service";
import { removeCouponFromCart } from "../../../helpers/coupon";


interface RemoveCouponResult {
  message: string;
  data: Awaited<ReturnType<typeof buildCartWithPromotions>> | null;
}

export async function removeCouponService(
  userId: string,
  customerRole: string | null,
): Promise<RemoveCouponResult> {
  await removeCouponFromCart(userId);

  const { data: updatedCart } = await getActiveCartService(userId);
  const data = updatedCart
    ? await buildCartWithPromotions(updatedCart, userId, customerRole)
    : null;

  return { message: "Cupón removido del carrito", data };
}
