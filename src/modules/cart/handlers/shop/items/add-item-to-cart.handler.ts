import { RouteHandler } from "fastify";
import { CreateCartItemInput } from "../../../schemas";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { addItemToCartService } from "../../../services/shop";

interface Handler extends RouteHandler<{ Body: CreateCartItemInput }> {}

export const addItemToCartHandler: Handler = async (request, reply) => {
  try {
    const { userId, customerRole } = request.user;

    const { message, data } = await addItemToCartService(
      userId,
      customerRole ?? null,
      request.body,
    );

    return reply.send({ success: true, msg: message, data });
  } catch (error) {
    return handleCartError(error, reply, request, "agregar item al carrito");
  }
};
