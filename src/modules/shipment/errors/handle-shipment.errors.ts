import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultShipmentErrorHandler } from "./default.error";
import { ShipmentNotFoundErrorHandler } from "./custom/shipment-not-found.error";
import { InvalidShipmentTransitionErrorHandler } from "./custom/invalid-shipment-transition.error";
import { ShipmentAlreadyTerminalErrorHandler } from "./custom/shipment-already-terminal.error";
import { CarrierRequiredErrorHandler } from "./custom/carrier-required.error";
import { AddressRequiredErrorHandler } from "./custom/address-required.error";
import { DeliveryNotAvailableErrorHandler } from "./custom/delivery-not-available.error";

const errorHandlers = [
    new ShipmentNotFoundErrorHandler(),
    new InvalidShipmentTransitionErrorHandler(),
    new ShipmentAlreadyTerminalErrorHandler(),
    new CarrierRequiredErrorHandler(),
    new AddressRequiredErrorHandler(),
    new DeliveryNotAvailableErrorHandler(),
    new DefaultShipmentErrorHandler(),
];

export const handleShipmentError = (
    error: unknown,
    reply: FastifyReply,
    request: FastifyRequest,
    context: string,
) => {
    for (const handler of errorHandlers) {
        const result = handler.handle(error, reply, request, context);
        if (result) return result;
    }
};
