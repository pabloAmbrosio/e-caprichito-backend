import { RouteHandler } from 'fastify';
import { ListPaymentsQuery } from '../../schemas';
import { listAllPayments } from '../../services';
import { handlePaymentError } from '../../errors';

interface Handler extends RouteHandler<{
    Querystring: ListPaymentsQuery
}> {}

export const listPendingPaymentsHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await listAllPayments(request.query);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "listar pagos");
    }
};
