import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class UserNotFoundError extends UserError {
    constructor(userId: string) {
        super(404, `Usuario con id "${userId}" no encontrado`, 'USER_NOT_FOUND');
    }
}

export class UserNotFoundErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof UserNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
