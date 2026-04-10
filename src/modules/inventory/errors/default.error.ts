import { FastifyReply, FastifyRequest } from "fastify";
import { InventoryErrorHandler } from "./inventory.error-class";

export class DefaultInventoryErrorHandler implements InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
        request.log.error(error, `Error interno: ${context}`);
        reply.status(500).send({
            success: false,
            msg: `Error interno al ${context}`,
            code: "INTERNAL_ERROR",
        });
    }
}
