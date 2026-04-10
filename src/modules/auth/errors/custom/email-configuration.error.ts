import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class EmailConfigurationError extends AuthError {
  constructor() {
    super(500, 'Email real no configurado. Configura el servicio de email o usa EMAIL_MODE=log', "EMAIL_CONFIGURATION_ERROR");
  }
}

export class EmailConfigurationErrorHandler implements AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply): FastifyReply | void {
    if (!(error instanceof EmailConfigurationError)) return;

    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }
}
