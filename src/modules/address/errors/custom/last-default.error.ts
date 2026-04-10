import { FastifyReply } from "fastify";
import { AddressError, AddressErrorHandler } from "../address.error-class";

export class LastDefaultError extends AddressError {
    constructor() {
        super(400, "No puedes quitar la direccion predeterminada si es la unica", "LAST_DEFAULT_ADDRESS");
    }
}

export class LastDefaultErrorHandler implements AddressErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof LastDefaultError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
