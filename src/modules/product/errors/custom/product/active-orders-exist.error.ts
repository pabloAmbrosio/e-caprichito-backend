import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class ActiveOrdersExistError extends ProductError {
    public orderCount: number;

    constructor(count: number) {
        super(
            409,
            `No se puede modificar el producto porque tiene ${count} orden(es) activa(s) (PENDING/CONFIRMED)`,
            'ACTIVE_ORDERS_EXIST'
        );
        this.orderCount = count;
    }
}

export class ActiveOrdersExistErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof ActiveOrdersExistError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
