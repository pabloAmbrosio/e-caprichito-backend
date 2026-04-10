import { FastifyReply, FastifyRequest } from "fastify";

export class OrderError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code: string
    ) {
        super(message);
    }
}

export interface OrderErrorHandler {
  handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void;
}
