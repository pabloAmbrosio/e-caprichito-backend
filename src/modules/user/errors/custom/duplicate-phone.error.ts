import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class DuplicatePhoneError extends UserError {
    constructor(_phone?: string) {
        super(409, 'Ya existe un usuario con esos datos', 'PHONE_TAKEN');
    }
}

export class DuplicatePhoneErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof DuplicatePhoneError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
