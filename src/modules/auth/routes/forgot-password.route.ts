import { FastifyInstance } from "fastify";
import { forgotPasswordHandler } from "../handlers";
import { ForgotPasswordInput, ForgotPasswordSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body: ForgotPasswordInput
}

const schema = {
    body: ForgotPasswordSchema
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/forgot-password`,
        {
            schema,
            config: {
                rateLimit: {
                    max: 3,
                    timeWindow: '1 minute',
                    keyGenerator: (request: any) => {
                        const identifier = request.body?.identifier || 'unknown';
                        return `forgot:${request.ip}:${identifier}`;
                    }
                }
            }
        },
        forgotPasswordHandler
    );
};
