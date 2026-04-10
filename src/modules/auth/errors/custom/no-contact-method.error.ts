import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class NoContactMethodError extends AuthError {
  constructor() {
    super(422, 'Este usuario no tiene teléfono ni email registrado. Agrega un método de contacto o comunícate con soporte.', "NO_CONTACT_METHOD");
  }
}

export class NoContactMethodErrorHandler implements AuthErrorHandler {
  handle(error: unknown, reply: FastifyReply): FastifyReply | void {
    if (!(error instanceof NoContactMethodError)) return;

    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }
}
