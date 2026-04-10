import { FastifyReply, FastifyRequest } from 'fastify';
import { DefaultCartErrorHandler } from './default.error';
import { CartNotFoundErrorHandler } from './custom/cart-not-found.error';
import { CartEmptyErrorHandler } from './custom/cart-empty.error';
import { CartItemNotFoundErrorHandler } from './custom/cart-item-not-found.error';
import { ProductNotFoundErrorHandler } from './custom/product-not-found.error';
import { InsufficientStockErrorHandler } from './custom/insufficient-stock.error';
import { MaxQuantityExceededErrorHandler } from './custom/max-quantity-exceeded.error';
import { MaxItemsExceededErrorHandler } from './custom/max-items-exceeded.error';
import { InvalidCouponErrorHandler } from './custom/invalid-coupon.error';
import { OutOfStockErrorHandler } from './custom/out-of-stock.error';
import { CouponValidationErrorHandler } from './custom/coupon-validation.error';

const errorHandlers = [
    new CartNotFoundErrorHandler(),
    new CartEmptyErrorHandler(),
    new CartItemNotFoundErrorHandler(),
    new ProductNotFoundErrorHandler(),
    new InsufficientStockErrorHandler(),
    new MaxQuantityExceededErrorHandler(),
    new MaxItemsExceededErrorHandler(),
    new InvalidCouponErrorHandler(),
    new OutOfStockErrorHandler(),
    new CouponValidationErrorHandler(),
    new DefaultCartErrorHandler()
];

export const handleCartError = (
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
