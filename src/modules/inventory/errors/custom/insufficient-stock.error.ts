import { FastifyReply } from "fastify";
import { InventoryError, InventoryErrorHandler } from "../inventory.error-class";

export class InsufficientStockError extends InventoryError {
    constructor(productId: string, requested: number, available: number) {
        super(
            409,
            `Stock insuficiente para "${productId}": solicitado ${requested}, disponible ${available}`,
            "INSUFFICIENT_STOCK"
        );
    }
}

export class InsufficientStockErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InsufficientStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
