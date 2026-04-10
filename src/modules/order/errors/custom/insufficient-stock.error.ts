import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

// 422: el servidor entiende la solicitud pero el stock no alcanza
export class InsufficientStockError extends OrderError {
    constructor(productTitle: string, requested: number, available: number) {
        super(
            422,
            `Stock insuficiente para "${productTitle}": solicitado ${requested}, disponible ${available}`,
            "INSUFFICIENT_STOCK"
        );
    }
}

export class InsufficientStockErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InsufficientStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
