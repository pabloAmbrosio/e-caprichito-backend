import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class InvalidBankReferenceError extends PaymentError {
    constructor() {
        super(400, "La referencia bancaria contiene caracteres no permitidos. Solo se permiten letras, numeros, guiones y espacios.", "INVALID_BANK_REFERENCE");
    }
}

export class InvalidBankReferenceErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidBankReferenceError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
