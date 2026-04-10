import { FastifyReply, FastifyRequest } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class OTPCooldownError extends AuthError {
  constructor(cooldownSeconds: number) {
    super(429, `Espera ${cooldownSeconds} segundos antes de solicitar otro código`, "OTP_COOLDOWN");
    this.name = 'OTPCooldownError';
  }
}

export class OTPCooldownErrorHandler implements AuthErrorHandler  {
    handle(error: unknown, reply: FastifyReply) : FastifyReply | void {
        
        if (!(error instanceof OTPCooldownError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}