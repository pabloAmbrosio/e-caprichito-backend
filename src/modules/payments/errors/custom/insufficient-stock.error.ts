import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class InsufficientStockError extends PaymentError {
    constructor(detail: string) {
        super(400, `Stock insuficiente: ${detail}`, "INSUFFICIENT_STOCK");
    }
}

export class InsufficientStockErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InsufficientStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
