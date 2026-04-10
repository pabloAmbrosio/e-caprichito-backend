import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class DuplicateFieldError extends UserError {
    constructor() {
        super(409, 'Ya existe un usuario con esos datos', 'DUPLICATE_FIELD');
    }
}

export class DuplicateFieldErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof DuplicateFieldError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
