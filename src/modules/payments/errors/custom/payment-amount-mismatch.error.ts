import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentAmountMismatchError extends PaymentError {
    constructor(expected: number, received: number) {
        super(400, `El monto del pago (${received}) no coincide con el total de la orden (${expected})`, "PAYMENT_AMOUNT_MISMATCH");
    }
}

export class PaymentAmountMismatchErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentAmountMismatchError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
