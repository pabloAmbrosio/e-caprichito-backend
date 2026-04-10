import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class InventoryNotRegisteredError extends OrderError {
    constructor(productTitle: string) {
        super(404, `No hay inventario registrado para el producto: ${productTitle}`, "INVENTORY_NOT_REGISTERED");
    }
}

export class InventoryNotRegisteredErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InventoryNotRegisteredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
