import { FastifyReply, FastifyRequest } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class CodRequiresHomeDeliveryError extends OrderError {
    constructor() {
        super(400, "El pago contra entrega solo está disponible para envío a domicilio", "COD_REQUIRES_HOME_DELIVERY");
    }
}

export class CodRequiresHomeDeliveryErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CodRequiresHomeDeliveryError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
