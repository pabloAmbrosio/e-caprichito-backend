import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultAddressErrorHandler } from "./default.error";
import { AddressNotFoundErrorHandler } from "./custom/address-not-found.error";
import { AddressNotOwnedErrorHandler } from "./custom/address-not-owned.error";
import { AddressLimitErrorHandler } from "./custom/address-limit.error";
import { AddressInUseErrorHandler } from "./custom/address-in-use.error";
import { LastDefaultErrorHandler } from "./custom/last-default.error";

const errorHandlers = [
    new AddressNotFoundErrorHandler(),
    new AddressNotOwnedErrorHandler(),
    new AddressLimitErrorHandler(),
    new AddressInUseErrorHandler(),
    new LastDefaultErrorHandler(),
    new DefaultAddressErrorHandler(),
];

export const handleAddressError = (
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
