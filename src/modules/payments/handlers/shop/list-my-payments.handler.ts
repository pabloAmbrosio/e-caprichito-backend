import { RouteHandler } from 'fastify';
import { ListPaymentsQuery } from '../../schemas';
import { listMyPayments } from '../../services';
import { handlePaymentError } from '../../errors';

interface Handler extends RouteHandler<{
    Querystring: ListPaymentsQuery
}> {}

export const listMyPaymentsHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await listMyPayments(userId, request.query);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "listar pagos");
    }
};
