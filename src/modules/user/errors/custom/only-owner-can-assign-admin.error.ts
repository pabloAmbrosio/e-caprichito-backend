import { FastifyReply, FastifyRequest } from 'fastify';
import { UserError, UserErrorHandler } from '../user.error';

export class OnlyOwnerCanAssignAdminError extends UserError {
    constructor() {
        super(403, 'Solo un OWNER puede asignar el rol ADMIN', 'ONLY_OWNER_CAN_ASSIGN_ADMIN');
    }
}

export class OnlyOwnerCanAssignAdminErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof OnlyOwnerCanAssignAdminError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
