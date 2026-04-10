import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class UnauthorizedReviewerError extends PaymentError {
    constructor() {
        super(403, "No tienes permisos para revisar pagos", "UNAUTHORIZED_REVIEWER");
    }
}

export class UnauthorizedReviewerErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof UnauthorizedReviewerError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
