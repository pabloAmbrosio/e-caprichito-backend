import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class CategoryNotFoundError extends ProductError {
    constructor() {
        super(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
    }
}

export class CategoryNotFoundErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CategoryNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
