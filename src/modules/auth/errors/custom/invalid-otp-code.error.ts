import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class InvalidOTPCodeError extends AuthError {
    constructor() {
        super(400, "Código inválido o expirado", "INVALID_OTP_CODE");
    }
}

export class InvalidOTPCodeErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidOTPCodeError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
