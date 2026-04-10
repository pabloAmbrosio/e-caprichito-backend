import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentNotPendingError extends PaymentError {
    constructor() {
        super(400, "El pago no esta en estado pendiente", "PAYMENT_NOT_PENDING");
    }
}

export class PaymentNotPendingErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentNotPendingError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
