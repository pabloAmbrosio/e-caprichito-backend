import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class DuplicateEntryError extends ProductError {
    constructor() {
        super(409, 'Ya existe un registro con esos datos unicos', 'DUPLICATE_ENTRY');
    }
}

export class DuplicateEntryErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof DuplicateEntryError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
