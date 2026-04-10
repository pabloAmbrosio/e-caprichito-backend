import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class OrderNotOwnedError extends PaymentError {
    constructor() {
        super(403, "Esta orden no te pertenece", "ORDER_NOT_OWNED");
    }
}

export class OrderNotOwnedErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof OrderNotOwnedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
