import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class GoogleOAuthError extends AuthError {
    constructor(message: string = "Hubo un problema al conectar con Google, por favor intenta de nuevo") {
        super(502, message, "GOOGLE_OAUTH_ERROR");
    }
}

export class GoogleOAuthErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof GoogleOAuthError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
