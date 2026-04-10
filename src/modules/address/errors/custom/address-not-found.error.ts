import { FastifyReply } from "fastify";
import { AddressError, AddressErrorHandler } from "../address.error-class";

export class AddressNotFoundError extends AddressError {
    constructor(addressId: string) {
        super(404, `Direccion "${addressId}" no encontrada`, "ADDRESS_NOT_FOUND");
    }
}

export class AddressNotFoundErrorHandler implements AddressErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
