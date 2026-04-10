import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class CannotModifyOthersProductsError extends ProductError {
    constructor() {
        super(403, 'No puedes modificar productos de otros usuarios', 'CANNOT_MODIFY_OTHERS_PRODUCTS');
    }
}

export class CannotModifyOthersProductsErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CannotModifyOthersProductsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
