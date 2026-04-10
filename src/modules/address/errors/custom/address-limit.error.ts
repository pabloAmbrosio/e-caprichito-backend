import { FastifyReply } from "fastify";
import { AddressError, AddressErrorHandler } from "../address.error-class";
import { MAX_ADDRESSES_PER_USER } from "../../constants";

export class AddressLimitError extends AddressError {
    constructor() {
        super(400, `No puedes tener mas de ${MAX_ADDRESSES_PER_USER} direcciones activas`, "ADDRESS_LIMIT_EXCEEDED");
    }
}

export class AddressLimitErrorHandler implements AddressErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressLimitError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
