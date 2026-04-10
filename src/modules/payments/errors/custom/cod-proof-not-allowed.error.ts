import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class CodProofNotAllowedError extends PaymentError {
    constructor() {
        super(400, "Los pagos contra entrega no requieren comprobante", "COD_PROOF_NOT_ALLOWED");
    }
}

export class CodProofNotAllowedErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CodProofNotAllowedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
