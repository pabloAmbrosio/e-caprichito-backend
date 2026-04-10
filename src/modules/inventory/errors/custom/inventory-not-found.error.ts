import { FastifyReply } from "fastify";
import { InventoryError, InventoryErrorHandler } from "../inventory.error-class";

export class InventoryNotFoundError extends InventoryError {
    constructor(productId: string) {
        super(404, `No existe inventario para el producto "${productId}"`, "INVENTORY_NOT_FOUND");
    }
}

export class InventoryNotFoundErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InventoryNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
