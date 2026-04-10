import { FastifyRequest, FastifyReply } from "fastify";
import { getOrderSummaryService } from "../../services";
import type { OrderSummaryInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
  Querystring: OrderSummaryInput;
}> {}

export const getOrderSummaryHandler = async (
  request: HandlerRequest,
  reply: FastifyReply,
) => {
  try {
    const { msg, data } = await getOrderSummaryService(request.query);
    return reply.send({ success: true, msg, data });
  } catch (error) {
    return handleOrderError(error, reply, request, "resumen de ordenes");
  }
};
