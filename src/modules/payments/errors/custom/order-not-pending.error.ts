import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class OrderNotPendingError extends PaymentError {
    constructor() {
        super(400, "La orden no esta pendiente de pago", "ORDER_NOT_PENDING");
    }
}

export class OrderNotPendingErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof OrderNotPendingError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
