import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class SMSConfigurationError extends AuthError {
  constructor() {
    super(500, 'SMS real no configurado. Configura Twilio o usa SMS_MODE=log', "SMS_CONFIGURATION_ERROR");
    this.name = 'SMSConfigurationError';
  }
}

export class SMSConfigurationErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof SMSConfigurationError)) return;
        
        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}