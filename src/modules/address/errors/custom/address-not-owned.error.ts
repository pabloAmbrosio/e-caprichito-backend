import { FastifyReply } from "fastify";
import { AddressError, AddressErrorHandler } from "../address.error-class";

export class AddressNotOwnedError extends AddressError {
    constructor() {
        super(403, "Esta direccion no te pertenece", "ADDRESS_NOT_OWNED");
    }
}

export class AddressNotOwnedErrorHandler implements AddressErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressNotOwnedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
