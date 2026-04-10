import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class InvalidShipmentTransitionError extends ShipmentError {
    constructor(from: string, to: string) {
        super(422, `Transicion invalida de "${from}" a "${to}"`, "INVALID_SHIPMENT_TRANSITION");
    }
}

export class InvalidShipmentTransitionErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidShipmentTransitionError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
