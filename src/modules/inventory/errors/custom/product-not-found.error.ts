import { FastifyReply } from "fastify";
import { InventoryError, InventoryErrorHandler } from "../inventory.error-class";

export class ProductNotFoundError extends InventoryError {
    constructor(productId: string) {
        super(404, `Producto con id "${productId}" no encontrado`, "PRODUCT_NOT_FOUND");
    }
}

export class ProductNotFoundErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof ProductNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
