import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export class AuthError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code: string
    ) {
        super(message);
    }
}

export interface AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void;
}
