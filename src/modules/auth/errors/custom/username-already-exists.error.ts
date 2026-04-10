import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class UsernameAlreadyExistsError extends AuthError {
    constructor(username: string) {
        super(409, `El username "${username}" ya está en uso`, "USERNAME_ALREADY_EXISTS");
    }
}

export class UsernameAlreadyExistsErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof UsernameAlreadyExistsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
