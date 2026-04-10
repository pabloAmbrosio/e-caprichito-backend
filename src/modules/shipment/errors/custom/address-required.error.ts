import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class AddressRequiredError extends ShipmentError {
    constructor() {
        super(400, "Se requiere una direccion para HOME_DELIVERY o SHIPPING", "ADDRESS_REQUIRED");
    }
}

export class AddressRequiredErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressRequiredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
