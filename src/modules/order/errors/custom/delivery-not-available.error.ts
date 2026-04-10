import { FastifyReply } from "fastify";
import { OrderErrorHandler } from "../order.error-class";
import { DeliveryNotAvailableError } from "../../adapters";

export class DeliveryNotAvailableErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof DeliveryNotAvailableError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
