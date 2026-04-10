import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentNotAwaitingReviewError extends PaymentError {
    constructor() {
        super(400, "El pago no esta esperando revision", "PAYMENT_NOT_AWAITING_REVIEW");
    }
}

export class PaymentNotAwaitingReviewErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentNotAwaitingReviewError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
