import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class OrderNotFoundError extends PaymentError {
    constructor() {
        super(404, "Orden no encontrada", "ORDER_NOT_FOUND");
    }
}

export class OrderNotFoundErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof OrderNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
