import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class UserAlreadyDeletedError extends UserError {
    constructor(userId: string) {
        super(400, `El usuario "${userId}" ya fue eliminado`, 'USER_ALREADY_DELETED');
    }
}

export class UserAlreadyDeletedErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof UserAlreadyDeletedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
