import { RouteHandler } from 'fastify';
import { SubmitPaymentInput } from '../../schemas';
import { submitPayment } from '../../services';
import { handlePaymentError } from '../../errors';

interface Handler extends RouteHandler<{
    Body: SubmitPaymentInput
}> {}

export const submitPaymentHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await submitPayment(request.body, userId);

        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "crear pago");
    }
};
