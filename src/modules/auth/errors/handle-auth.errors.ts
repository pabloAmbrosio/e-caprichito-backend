import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultErrorHandler } from './default.error';
import { OTPCooldownErrorHandler } from './custom/otp-cooldown.error';
import { OTPDailyLimitErrorHandler } from './custom/otp-daily-limit.error';
import { PhoneAlreadyExistsErrorHandler } from './custom/phone-already-exist.error';
import { SMSConfigurationErrorHandler } from './custom/sms-configuration.error';
import { UserNotFoundErrorHandler } from './custom/user-not-found.error';
import { InvalidCredentialsErrorHandler } from './custom/invalid-credentials.error';
import { UsernameAlreadyExistsErrorHandler } from './custom/username-already-exists.error';
import { EmailAlreadyExistsErrorHandler } from './custom/email-already-exists.error';
import { GoogleLoginRequiredErrorHandler } from './custom/google-login-required.error';
import { InvalidOTPCodeErrorHandler } from './custom/invalid-otp-code.error';
import { TokenGenerationErrorHandler } from './custom/token-generation.error';
import { GoogleOAuthErrorHandler } from './custom/google-oauth.error';
import { SuspiciousTokenErrorHandler } from './custom/suspicious-token.error';
import { MissingRefreshTokenErrorHandler } from './custom/missing-refresh-token.error';
import { ExpiredRefreshTokenErrorHandler } from './custom/expired-refresh-token.error';
import { EmailConfigurationErrorHandler } from './custom/email-configuration.error';
import { NoContactMethodErrorHandler } from './custom/no-contact-method.error';


const errorHandlers = [
    new UserNotFoundErrorHandler(),
    new InvalidCredentialsErrorHandler(),
    new UsernameAlreadyExistsErrorHandler(),
    new EmailAlreadyExistsErrorHandler(),
    new PhoneAlreadyExistsErrorHandler(),
    new GoogleLoginRequiredErrorHandler(),
    new InvalidOTPCodeErrorHandler(),
    new OTPDailyLimitErrorHandler(),
    new OTPCooldownErrorHandler(),
    new SMSConfigurationErrorHandler(),
    new TokenGenerationErrorHandler(),
    new GoogleOAuthErrorHandler(),
    new SuspiciousTokenErrorHandler(),
    new MissingRefreshTokenErrorHandler(),
    new ExpiredRefreshTokenErrorHandler(),
    new EmailConfigurationErrorHandler(),
    new NoContactMethodErrorHandler(),
    new DefaultErrorHandler()
];

export const handleAuthError = (
  error: unknown,
  reply: FastifyReply,
  request: FastifyRequest,
  context: string
) => {
  for (const handler of errorHandlers) {
    const result = handler.handle(error, reply, request, context);
    if (result) return result;
  }
};