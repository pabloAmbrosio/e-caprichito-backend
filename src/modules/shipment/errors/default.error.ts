import { FastifyReply, FastifyRequest } from "fastify";
import { ShipmentErrorHandler } from "./shipment.error-class";

export class DefaultShipmentErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
        request.log.error(error, `Error interno: ${context}`);
        return reply.status(500).send({
            error: "INTERNAL_ERROR",
            message: `Error interno al ${context}`,
        });
    }
}
