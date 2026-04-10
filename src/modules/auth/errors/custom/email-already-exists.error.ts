import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class EmailAlreadyExistsError extends AuthError {
    constructor(email: string) {
        super(409, `El email "${email}" ya está registrado`, "EMAIL_ALREADY_EXISTS");
    }
}

export class EmailAlreadyExistsErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof EmailAlreadyExistsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
