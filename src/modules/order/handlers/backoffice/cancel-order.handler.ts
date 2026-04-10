import { FastifyRequest, FastifyReply } from "fastify";
import { cancelOrderBackofficeService } from "../../services";
import { OrderIdInput, CancelOrderBackofficeInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
  Params: OrderIdInput;
  Body: CancelOrderBackofficeInput;
}> {}

export const cancelOrderBackofficeHandler = async (request: HandlerRequest, reply: FastifyReply) => {
  try {
    const { orderId } = request.params;
    const { userId } = request.user;
    const { reason } = request.body;

    const { msg, data, notification } = await cancelOrderBackofficeService({
      orderId,
      staffId: userId,
      reason,
    });

    request.server.io.to(`user:${notification.customerId}`).emit("order:cancelled", {
      orderId: data.orderId,
      status: data.status,
      message: "Tu orden ha sido cancelada por el administrador.",
    });

    return reply.send({ success: true, msg, data });
  } catch (error) {
    return handleOrderError(error, reply, request, "cancelar orden desde backoffice");
  }
};
