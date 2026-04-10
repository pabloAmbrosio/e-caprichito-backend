import { FastifyReply } from "fastify";
import { ShipmentError, ShipmentErrorHandler } from "../shipment.error-class";

export class ShipmentAlreadyTerminalError extends ShipmentError {
    constructor(currentStatus: string) {
        super(409, `El envio ya esta en estado terminal "${currentStatus}"`, "SHIPMENT_ALREADY_TERMINAL");
    }
}

export class ShipmentAlreadyTerminalErrorHandler implements ShipmentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof ShipmentAlreadyTerminalError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
