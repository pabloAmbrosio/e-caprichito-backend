import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class PhoneAlreadyExistsError extends AuthError {
    constructor(phone: string) {
        super(409, `El teléfono "${phone}" ya está registrado`, "PHONE_ALREADY_EXISTS");
    }
}

export class PhoneAlreadyExistsErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PhoneAlreadyExistsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}