import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultInventoryErrorHandler } from "./default.error";
import { ProductNotFoundErrorHandler } from "./custom/product-not-found.error";
import { InventoryNotFoundErrorHandler } from "./custom/inventory-not-found.error";
import { InsufficientStockErrorHandler } from "./custom/insufficient-stock.error";
import { NegativeStockErrorHandler } from "./custom/negative-stock.error";
import { InvalidStockErrorHandler } from "./custom/invalid-stock.error";

const errorHandlers = [
    new ProductNotFoundErrorHandler(),
    new InventoryNotFoundErrorHandler(),
    new InsufficientStockErrorHandler(),
    new NegativeStockErrorHandler(),
    new InvalidStockErrorHandler(),
    new DefaultInventoryErrorHandler(),
];

export const handleInventoryError = (
    error: unknown,
    reply: FastifyReply,
    request: FastifyRequest,
    context: string
) => {
    for (const handler of errorHandlers) {
        const result = handler.handle(error, reply, request, context);
        if (result) return result;
    }
};
