import { FastifyReply, FastifyRequest } from 'fastify';

export interface CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void;
}

export class CartError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code: string
    ) {
        super(message);
    }
}
