import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class CannotDeleteOwnAccountError extends UserError {
    constructor() {
        super(400, 'No puedes eliminar tu propia cuenta', 'CANNOT_DELETE_OWN_ACCOUNT');
    }
}

export class CannotDeleteOwnAccountErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CannotDeleteOwnAccountError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
