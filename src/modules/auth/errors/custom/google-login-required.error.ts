import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class GoogleLoginRequiredError extends AuthError {
    constructor() {
        super(400, "Esta cuenta usa login con Google. Usa el botón de Google para iniciar sesión.", "GOOGLE_LOGIN_REQUIRED");
    }
}

export class GoogleLoginRequiredErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof GoogleLoginRequiredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
