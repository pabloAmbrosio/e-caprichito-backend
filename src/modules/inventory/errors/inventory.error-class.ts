import { FastifyReply, FastifyRequest } from "fastify";

export class InventoryError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code: string
    ) {
        super(message);
    }
}

export interface InventoryErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void;
}
