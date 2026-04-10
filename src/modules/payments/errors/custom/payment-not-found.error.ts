import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentNotFoundError extends PaymentError {
    constructor(id: string) {
        super(404, `Pago "${id}" no encontrado`, "PAYMENT_NOT_FOUND");
    }
}

export class PaymentNotFoundErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
