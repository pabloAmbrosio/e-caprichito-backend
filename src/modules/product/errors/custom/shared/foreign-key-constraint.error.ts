import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class ForeignKeyConstraintError extends ProductError {
    constructor() {
        super(409, 'No se puede eliminar porque tiene registros relacionados (ordenes, carrito)', 'FOREIGN_KEY_CONSTRAINT');
    }
}

export class ForeignKeyConstraintErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof ForeignKeyConstraintError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
