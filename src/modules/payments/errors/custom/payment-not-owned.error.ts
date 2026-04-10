import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentNotOwnedError extends PaymentError {
    constructor() {
        super(403, "Este pago no te pertenece", "PAYMENT_NOT_OWNED");
    }
}

export class PaymentNotOwnedErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentNotOwnedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
