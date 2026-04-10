import { FastifyReply } from "fastify";
import { OrderErrorHandler } from "../order.error-class";
import { AddressRequiredError } from "../../adapters";

export class AddressRequiredErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof AddressRequiredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
