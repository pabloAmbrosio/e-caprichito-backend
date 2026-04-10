import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class CarrierRequiredError extends ShipmentError {
    constructor() {
        super(400, "Se requiere carrier y trackingCode para marcar como SHIPPED", "CARRIER_REQUIRED");
    }
}

export class CarrierRequiredErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof CarrierRequiredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
