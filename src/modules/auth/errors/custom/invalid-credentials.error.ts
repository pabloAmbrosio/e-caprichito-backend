import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super(401, "Credenciales inválidas", "INVALID_CREDENTIALS");
    }
}

export class InvalidCredentialsErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidCredentialsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
