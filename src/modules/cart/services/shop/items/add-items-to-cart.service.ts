import { CreateCartItemInput } from "../../../schemas";
import { buildCartWithPromotions } from "../../shared";
import { getActiveCartService } from "../cart/get-active-cart.service";
import { getOrCreateCart } from "../../../helpers/cart";
import { handleCartItemAddition } from "../../../helpers/items";

interface AddItemsResult {
  message: string;
  data: Awaited<ReturnType<typeof buildCartWithPromotions>> | null;
}

export async function addItemsToCartService(
  userId: string,
  customerRole: string | null,
  items: CreateCartItemInput[],
): Promise<AddItemsResult> {
  const cart = await getOrCreateCart(userId);

  for (const item of items) {
    await handleCartItemAddition(cart.id, item);
  }

  const { data: updatedCart } = await getActiveCartService(userId);
  const data = updatedCart
    ? await buildCartWithPromotions(updatedCart, userId, customerRole)
    : null;

  return {
    message: `${items.length} items agregados al carrito`,
    data,
  };
}
