import { FastifyReply } from "fastify";
import { InventoryError, InventoryErrorHandler } from "../inventory.error-class";

export class NegativeStockError extends InventoryError {
    constructor(productId: string) {
        super(
            422,
            `La operacion resultaria en stock negativo para "${productId}"`,
            "NEGATIVE_STOCK"
        );
    }
}

export class NegativeStockErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof NegativeStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
