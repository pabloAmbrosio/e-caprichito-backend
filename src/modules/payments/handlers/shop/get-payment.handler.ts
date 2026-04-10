import { RouteHandler } from 'fastify';
import { PaymentIdParams } from '../../schemas';
import { getPaymentById } from '../../services';
import { handlePaymentError } from '../../errors';

interface Handler extends RouteHandler<{
    Params: PaymentIdParams
}> {}

export const getPaymentHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await getPaymentById(request.params.id, userId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "obtener pago");
    }
};
