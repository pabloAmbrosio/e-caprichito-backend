import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class TokenGenerationError extends AuthError {
    constructor(message: string) {
        super(500, message, "TOKEN_GENERATION_ERROR");
    }
}

export class TokenGenerationErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof TokenGenerationError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
