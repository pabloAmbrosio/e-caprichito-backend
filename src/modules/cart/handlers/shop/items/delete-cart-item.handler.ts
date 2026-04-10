import { RouteHandler } from "fastify";
import { updateCartItemService } from "../../../services/shop";
import { CartItemInput } from "../../../schemas";
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler<{
  Params: CartItemInput;
}> {}

export const deleteCartItemHandler: Handler = async (request, reply) => {
  try {
    const { userId, customerRole } = request.user;
    const { productId } = request.params;

    // quantity = 0 → el servicio ya lo interpreta como eliminación
    const { message, data } = await updateCartItemService(
      userId,
      customerRole ?? null,
      productId,
      0,
    );

    return reply.send({ success: true, msg: message, data });
  } catch (error) {
    return handleCartError(error, reply, request, "eliminar item del carrito");
  }
};
