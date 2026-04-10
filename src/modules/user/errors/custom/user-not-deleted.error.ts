import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class UserNotDeletedError extends UserError {
    constructor(userId: string) {
        super(400, `El usuario "${userId}" no está eliminado`, 'USER_NOT_DELETED');
    }
}

export class UserNotDeletedErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof UserNotDeletedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
