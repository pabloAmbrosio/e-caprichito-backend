import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class CodSubmitNotAllowedError extends PaymentError {
    constructor() {
        super(400, "Los pagos contra entrega se crean automáticamente en el checkout", "COD_SUBMIT_NOT_ALLOWED");
    }
}

export class CodSubmitNotAllowedErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CodSubmitNotAllowedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
