import { buildCartWithPromotions } from "../../shared";
import { getCartHistory } from "../../../helpers/cart";


interface CartHistoryItem {
  id: string;
  abandonedAt: Date | null;
  [key: string]: unknown;
}

export async function getCartsHistoryService(
  userId: string,
  customerRole: string | null,
  pagination: { page: number; limit: number },
) {
  const carts = await getCartHistory(userId, pagination);

  const data: CartHistoryItem[] = await Promise.all(
    carts.map(async (cart) => {
      const cartData = await buildCartWithPromotions(cart, userId, customerRole);
      return {
        id: cart.id,
        ...cartData,
        abandonedAt: cart.deletedAt,
      };
    }),
  );

  return { message: "historial de carritos obtenido correctamente", data };
}