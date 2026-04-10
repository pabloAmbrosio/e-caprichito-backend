import { FastifyReply } from "fastify";
import { PaymentError, PaymentErrorHandler } from "../payment.error-class";

export class PaymentAmountOutOfRangeError extends PaymentError {
    constructor(min: number, max: number, amount: number) {
        super(400, `El monto del pago (${amount}) debe estar entre ${min} y ${max} centavos`, "PAYMENT_AMOUNT_OUT_OF_RANGE");
    }
}

export class PaymentAmountOutOfRangeErrorHandler implements PaymentErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PaymentAmountOutOfRangeError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
