import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class AbstractProductHasVariantsError extends ProductError {
    public variantCount: number;

    constructor(variantCount: number) {
        super(400, 'No se puede eliminar el producto porque tiene variantes asociadas', 'ABSTRACT_PRODUCT_HAS_VARIANTS');
        this.variantCount = variantCount;
    }
}

export class AbstractProductHasVariantsErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof AbstractProductHasVariantsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
            variantCount: error.variantCount,
            suggestion: 'Elimina primero todas las variantes antes de eliminar el producto',
        });
    }
}
