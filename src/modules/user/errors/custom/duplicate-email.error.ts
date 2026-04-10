import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class DuplicateEmailError extends UserError {
    constructor(_email?: string) {
        super(409, 'Ya existe un usuario con esos datos', 'EMAIL_TAKEN');
    }
}

export class DuplicateEmailErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof DuplicateEmailError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
