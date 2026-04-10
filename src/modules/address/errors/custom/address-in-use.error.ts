import { FastifyReply } from "fastify";
import { AddressError, AddressErrorHandler } from "../address.error-class";

export class AddressInUseError extends AddressError {
    constructor() {
        super(409, "Esta direccion esta asociada a un envio en curso", "ADDRESS_IN_USE");
    }
}

export class AddressInUseErrorHandler implements AddressErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressInUseError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
