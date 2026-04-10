import { RouteHandler } from "fastify";
import type { CheckoutBody } from "../../schemas";
import { createOrderFromCartService } from "../../services";
import { handleOrderError } from "../../errors";
import { emitOrderCreated } from "../../notifications/emit-order-created";

interface Handler extends RouteHandler<{
    Body: CheckoutBody;
}> {}

export const createOrderHandler: Handler = async (request, reply) => {
    try {
        const { userId, username } = request.user;
        const { addressId, paymentMethod } = request.body;

        const { msg, data } = await createOrderFromCartService({
            userId,
            addressId,
            paymentMethod,
        });

        emitOrderCreated(request.server.io, {
            orderId: data.orderId,
            customerUsername: username,
            itemCount: data.itemCount,
            total: data.total,
        });

        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "crear la orden");
    }
};
