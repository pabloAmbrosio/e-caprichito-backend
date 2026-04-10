import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class InvalidUserIdError extends PaymentError {
    constructor() {
        super(401, "Usuario no autenticado o ID de usuario invalido", "INVALID_USER_ID");
    }
}

export class InvalidUserIdErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidUserIdError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
