import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class InvalidProofDataError extends PaymentError {
    constructor(detail: string) {
        super(400, `Datos del comprobante invalidos: ${detail}`, "INVALID_PROOF_DATA");
    }
}

export class InvalidProofDataErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidProofDataError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
