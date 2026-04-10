import { FastifyReply, FastifyRequest } from 'fastify';
import { DefaultProductErrorHandler } from './default.error';
import { PrismaProductErrorHandler } from './prisma.error-handler';
import {
    AbstractProductNotFoundErrorHandler,
    AbstractProductHasVariantsErrorHandler,
    ProductNotFoundErrorHandler,
    ProductNotAvailableErrorHandler,
    CannotModifyOthersProductsErrorHandler,
    CannotChangeStatusErrorHandler,
    InvalidStatusTransitionErrorHandler,
    ActiveOrdersExistErrorHandler,
} from './custom/product';
import { CategoryNotFoundErrorHandler } from './custom/category';
import { DuplicateEntryErrorHandler, ForeignKeyConstraintErrorHandler } from './custom/shared';

const errorHandlers = [
    new AbstractProductNotFoundErrorHandler(),
    new CategoryNotFoundErrorHandler(),
    new ProductNotFoundErrorHandler(),
    new CannotModifyOthersProductsErrorHandler(),
    new CannotChangeStatusErrorHandler(),
    new AbstractProductHasVariantsErrorHandler(),
    new InvalidStatusTransitionErrorHandler(),
    new ActiveOrdersExistErrorHandler(),
    new ProductNotAvailableErrorHandler(),
    new DuplicateEntryErrorHandler(),
    new ForeignKeyConstraintErrorHandler(),
    new PrismaProductErrorHandler(),
    new DefaultProductErrorHandler()
];

export const handleProductError = (
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
