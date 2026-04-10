import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class CannotModifyOwnRoleError extends UserError {
    constructor() {
        super(403, 'No puedes modificar tu propio rol', 'CANNOT_MODIFY_OWN_ROLE');
    }
}

export class CannotModifyOwnRoleErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CannotModifyOwnRoleError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
