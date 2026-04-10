import { CreateCartItemInput } from "../../../schemas";
import { buildCartWithPromotions } from "../../shared";
import { getActiveCartService } from "../cart/get-active-cart.service";
import { getOrCreateCart } from "../../../helpers/cart";
import { handleCartItemAddition } from "../../../helpers/items";

const ACTION_MESSAGES = {
  added: "Item agregado al carrito",
  updated: "Cantidad actualizada en el carrito",
  removed: "Item eliminado del carrito",
} as const;

interface AddItemResult {
  message: string;
  data: Awaited<ReturnType<typeof buildCartWithPromotions>> | null;
}

export async function addItemToCartService(
  userId: string,
  customerRole: string | null,
  input: CreateCartItemInput,
): Promise<AddItemResult> {
  const cart = await getOrCreateCart(userId);

  const { action } = await handleCartItemAddition(cart.id, input);

  const { data: updatedCart } = await getActiveCartService(userId);
  const data = updatedCart
    ? await buildCartWithPromotions(updatedCart, userId, customerRole)
    : null;

  return { message: ACTION_MESSAGES[action], data };
}
