import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultPaymentErrorHandler } from "./default.error";
import { PaymentNotFoundErrorHandler } from "./custom/payment-not-found.error";
import { PaymentNotOwnedErrorHandler } from "./custom/payment-not-owned.error";
import { PaymentNotPendingErrorHandler } from "./custom/payment-not-pending.error";
import { PaymentNotAwaitingReviewErrorHandler } from "./custom/payment-not-awaiting-review.error";
import { PaymentAlreadyExistsErrorHandler } from "./custom/payment-already-exists.error";
import { OrderNotFoundErrorHandler } from "./custom/order-not-found.error";
import { OrderNotPendingErrorHandler } from "./custom/order-not-pending.error";
import { OrderNotOwnedErrorHandler } from "./custom/order-not-owned.error";
import { InsufficientStockErrorHandler } from "./custom/insufficient-stock.error";
import { PaymentAmountMismatchErrorHandler } from "./custom/payment-amount-mismatch.error";
import { InvalidProofUrlDomainErrorHandler } from "./custom/invalid-proof-url-domain.error";
import { InvalidProofDataErrorHandler } from "./custom/invalid-proof-data.error";
import { UnauthorizedReviewerErrorHandler } from "./custom/unauthorized-reviewer.error";
import { InvalidUserIdErrorHandler } from "./custom/invalid-user-id.error";
import { PaymentAmountOutOfRangeErrorHandler } from "./custom/payment-amount-out-of-range.error";
import { InvalidBankReferenceErrorHandler } from "./custom/invalid-bank-reference.error";
import { CodProofNotAllowedErrorHandler } from "./custom/cod-proof-not-allowed.error";
import { CodSubmitNotAllowedErrorHandler } from "./custom/cod-submit-not-allowed.error";

const errorHandlers = [
    new PaymentNotFoundErrorHandler(),
    new PaymentNotOwnedErrorHandler(),
    new PaymentNotPendingErrorHandler(),
    new PaymentNotAwaitingReviewErrorHandler(),
    new PaymentAlreadyExistsErrorHandler(),
    new OrderNotFoundErrorHandler(),
    new OrderNotPendingErrorHandler(),
    new OrderNotOwnedErrorHandler(),
    new InsufficientStockErrorHandler(),
    new PaymentAmountMismatchErrorHandler(),
    new InvalidProofUrlDomainErrorHandler(),
    new InvalidProofDataErrorHandler(),
    new UnauthorizedReviewerErrorHandler(),
    new InvalidUserIdErrorHandler(),
    new PaymentAmountOutOfRangeErrorHandler(),
    new InvalidBankReferenceErrorHandler(),
    new CodProofNotAllowedErrorHandler(),
    new CodSubmitNotAllowedErrorHandler(),
    new DefaultPaymentErrorHandler(),
];

export const handlePaymentError = (
    error: unknown,
    reply: FastifyReply,
    request: FastifyRequest,
    context: string
) => {
    for (const handler of errorHandlers) {
        const result = handler.handle(error, reply, request, context);
        if (result) return result;
    }
};
