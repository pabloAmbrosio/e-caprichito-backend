import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class CannotModifyOwnerError extends UserError {
    constructor() {
        super(403, 'No puedes modificar una cuenta OWNER', 'CANNOT_MODIFY_OWNER');
    }
}

export class CannotModifyOwnerErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CannotModifyOwnerError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
