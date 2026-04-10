import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultPromotionErrorHandler } from './default.error';
import { PromotionNotFoundErrorHandler } from './custom/promotion-not-found.error';
import { PromotionAlreadyDeletedErrorHandler } from './custom/promotion-already-deleted.error';
import { PromotionExpiredErrorHandler } from './custom/promotion-expired.error';
import { PromotionNotActiveErrorHandler } from './custom/promotion-not-active.error';
import { PromotionNotStartedErrorHandler } from './custom/promotion-not-started.error';
import { CouponNotFoundErrorHandler } from './custom/coupon-not-found.error';
import { CouponAlreadyExistsErrorHandler } from './custom/coupon-already-exists.error';
import { MaxUsesReachedErrorHandler } from './custom/max-uses-reached.error';
import { RuleNotFoundErrorHandler } from './custom/rule-not-found.error';
import { ActionNotFoundErrorHandler } from './custom/action-not-found.error';
import { CartErrorHandler } from './custom/cart-error.error';

const errorHandlers = [
    new PromotionNotFoundErrorHandler(),
    new PromotionAlreadyDeletedErrorHandler(),
    new PromotionExpiredErrorHandler(),
    new PromotionNotActiveErrorHandler(),
    new PromotionNotStartedErrorHandler(),
    new CouponNotFoundErrorHandler(),
    new CouponAlreadyExistsErrorHandler(),
    new MaxUsesReachedErrorHandler(),
    new RuleNotFoundErrorHandler(),
    new ActionNotFoundErrorHandler(),
    new CartErrorHandler(),
    new DefaultPromotionErrorHandler()
];

export const handlePromotionError = (
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
