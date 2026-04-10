import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class DeliveryNotAvailableError extends ShipmentError {
    constructor() {
        super(400, "Entrega a domicilio no disponible para esta ubicacion", "DELIVERY_NOT_AVAILABLE");
    }
}

export class DeliveryNotAvailableErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof DeliveryNotAvailableError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
