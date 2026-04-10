import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentAlreadyExistsError extends PaymentError {
    constructor() {
        super(409, "Ya existe un pago activo para esta orden", "PAYMENT_ALREADY_EXISTS");
    }
}

export class PaymentAlreadyExistsErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentAlreadyExistsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
