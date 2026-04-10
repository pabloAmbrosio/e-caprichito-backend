import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class MissingRefreshTokenError extends AuthError {
  constructor() {
    super(
      401,
      'No se encontró un refresh token en la solicitud.',
      'MISSING_REFRESH_TOKEN'
    );
  }
}

export class MissingRefreshTokenErrorHandler implements AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply): FastifyReply | void {
    if (!(error instanceof MissingRefreshTokenError)) return;

    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }
}
