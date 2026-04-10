import { FastifyReply } from "fastify";
import { AuthError, AuthErrorHandler } from "../auth.error-class";

export class OTPDailyLimitError extends AuthError {
  constructor(limit: number) {
    super(429, `Has alcanzado el límite diario de ${limit} códigos OTP. Intenta mañana.`, "OTP_DAILY_LIMIT");
  }
}

export class OTPDailyLimitErrorHandler implements AuthErrorHandler {
    handle(error: unknown, reply: FastifyReply):FastifyReply | void {
        
        if (!(error instanceof OTPDailyLimitError)) return ;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });

    }
}