import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class UserNotFoundError extends AuthError {
    constructor(message = "Usuario no encontrado") {
        super(404, message, "USER_NOT_FOUND");
    }
}

export class UserNotFoundErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof UserNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
