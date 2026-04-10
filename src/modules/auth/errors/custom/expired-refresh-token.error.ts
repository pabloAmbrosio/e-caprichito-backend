import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class ExpiredRefreshTokenError extends AuthError {
  constructor() {
    super(
      401,
      'La sesión ha expirado. Por favor inicia sesión nuevamente.',
      'EXPIRED_REFRESH_TOKEN'
    );
  }
}

export class ExpiredRefreshTokenErrorHandler implements AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply): FastifyReply | void {
    if (!(error instanceof ExpiredRefreshTokenError)) return;

    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }
}
