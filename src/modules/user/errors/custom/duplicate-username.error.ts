import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class DuplicateUsernameError extends UserError {
    constructor(_username?: string) {
        super(409, 'Ya existe un usuario con esos datos', 'USERNAME_TAKEN');
    }
}

export class DuplicateUsernameErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof DuplicateUsernameError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
