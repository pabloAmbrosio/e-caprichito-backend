import { RouteHandler } from "fastify";
import { CreateCartItemsInput } from "../../../schemas";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { addItemsToCartService } from "../../../services/shop";

interface Handler extends RouteHandler<{ Body: CreateCartItemsInput }> {}

export const addItemsToCartHandler: Handler = async (request, reply) => {
  try {
    const { userId, customerRole } = request.user;

    const { message, data } = await addItemsToCartService(
      userId,
      customerRole,
      request.body.items,
    );

    return reply.send({ success: true, msg: message, data });
  } catch (error) {
    return handleCartError(error, reply, request, "agregar items al carrito");
  }
};
