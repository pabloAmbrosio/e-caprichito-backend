import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class ShipmentNotFoundError extends ShipmentError {
    constructor() {
        super(404, "Envio no encontrado", "SHIPMENT_NOT_FOUND");
    }
}

export class ShipmentNotFoundErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof ShipmentNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
