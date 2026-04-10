import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class InvalidProofUrlDomainError extends PaymentError {
    constructor(url: string) {
        super(400, `La URL del comprobante no pertenece a un dominio permitido: ${url}`, "INVALID_PROOF_URL_DOMAIN");
    }
}

export class InvalidProofUrlDomainErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidProofUrlDomainError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
