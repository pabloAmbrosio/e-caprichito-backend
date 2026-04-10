import { buildCartWithPromotions } from "../../shared";
import { getActiveCartService } from "../cart/get-active-cart.service";
import { removeCartItem, updateCartItemQuantity } from "../../../helpers/items";


interface UpdateCartItemResult {
  message: string;
  data: Awaited<ReturnType<typeof buildCartWithPromotions>> | null;
}

export async function updateCartItemService(
  userId: string,
  customerRole: string | null,
  productId: string,
  quantity: number,
): Promise<UpdateCartItemResult> {

  const isRemoval = quantity === 0;

  if (isRemoval) {
    await removeCartItem(userId, productId);
  } else {
    await updateCartItemQuantity(userId, productId, quantity);
  }

  const { data: updatedCart } = await getActiveCartService(userId);
  const data = updatedCart
    ? await buildCartWithPromotions(updatedCart, userId, customerRole)
    : null;

  const message = isRemoval
    ? "Item eliminado del carrito"
    : "Cantidad actualizada correctamente";

  return { message, data };
}
