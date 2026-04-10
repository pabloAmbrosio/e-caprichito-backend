import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class SuspiciousTokenError extends AuthError {
  constructor() {
    super(
      401,
      'Token sospechoso detectado: el token ya fue utilizado o revocado. Todas las sesiones han sido cerradas por seguridad.',
      'SUSPICIOUS_TOKEN_DETECTED'
    );
  }
}

export class SuspiciousTokenErrorHandler implements AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply): FastifyReply | void {
    if (!(error instanceof SuspiciousTokenError)) return;

    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }
}
