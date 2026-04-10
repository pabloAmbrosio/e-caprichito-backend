import { FastifyInstance } from "fastify";
import registerRoute from './register.route';
import loginRoute from './login.route';
import verifyPhoneRoute from './verify-phone.route';
import requestOTPRoute from './request-otp.route';
import refreshTokenRoute from './refresh-token.route';
// googleRoute no se importa porque @fastify/oauth2 registra /api/auth/google automáticamente
import googleCallbackRoute from './google-callback.route';
import addPhoneRoute from './add-phone.route';
import logoutRoute from './logout.route';
import forgotPasswordRoute from './forgot-password.route';
import resetPasswordRoute from './reset-password.route';
import checkIdentifierRoute from './check-identifier.route';
import otpStatusRoute from './otp-status.route';

export default (app: FastifyInstance) => {
    app.register(registerRoute);
    app.register(loginRoute);
    app.register(verifyPhoneRoute);
    app.register(requestOTPRoute);
    app.register(refreshTokenRoute);
    app.register(googleCallbackRoute);
    app.register(addPhoneRoute);
    app.register(logoutRoute);
    app.register(forgotPasswordRoute);
    app.register(resetPasswordRoute);
    app.register(checkIdentifierRoute);
    app.register(otpStatusRoute);
}