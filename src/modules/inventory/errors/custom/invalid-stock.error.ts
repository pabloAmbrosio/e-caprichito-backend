import { FastifyReply } from "fastify";
import { InventoryError, InventoryErrorHandler } from "../inventory.error-class";

export class InvalidStockError extends InventoryError {
    constructor(productId: string, value: number) {
        super(
            400,
            `El stock fisico no puede ser negativo para "${productId}": valor recibido ${value}`,
            "INVALID_STOCK"
        );
    }
}

export class InvalidStockErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
