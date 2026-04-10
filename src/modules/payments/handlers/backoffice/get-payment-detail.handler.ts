import { RouteHandler } from 'fastify';
import { PaymentIdParams } from '../../schemas';
import { getPaymentDetail } from '../../services';
import { handlePaymentError } from '../../errors';

interface Handler extends RouteHandler<{
    Params: PaymentIdParams
}> {}

export const getPaymentDetailHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await getPaymentDetail(request.params.id);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "obtener detalle de pago");
    }
};
