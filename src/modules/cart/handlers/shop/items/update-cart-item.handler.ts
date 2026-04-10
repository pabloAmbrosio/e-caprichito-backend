import { RouteHandler } from "fastify";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { UpdateCartItemInput, CartItemInput } from "../../../schemas";
import { updateCartItemService } from "../../../services/shop";

interface Handler extends RouteHandler<{
  Body: UpdateCartItemInput;
  Params: CartItemInput;
}> {}

export const updateCartItemHandler: Handler = async (request, reply) => {
  try {
    const { userId, customerRole } = request.user;
    const { productId } = request.params;
    const { quantity } = request.body;

    const { message, data } = await updateCartItemService(
      userId,
      customerRole ?? null,
      productId,
      quantity,
    );

    return reply.send({ success: true, msg: message, data });
  } catch (error) {
    return handleCartError(error, reply, request, "actualizar item del carrito");
  }
};
