import { RouteHandler } from "fastify";
import type { CalculateFeeBody } from "../../schemas";
import { calculateFeeService } from "../../services/shop";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Body: CalculateFeeBody;
}> {}

export const calculateFeeHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await calculateFeeService(userId, request.body);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "calcular tarifa de envio");
    }
};
