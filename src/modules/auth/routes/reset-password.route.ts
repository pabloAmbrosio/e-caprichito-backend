import { FastifyInstance } from "fastify";
import { resetPasswordHandler } from "../handlers";
import { ResetPasswordInput, ResetPasswordSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body: ResetPasswordInput
}

const schema = {
    body: ResetPasswordSchema
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/reset-password`,
        {
            schema,
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: '1 minute',
                    keyGenerator: (request: any) => {
                        const userId = request.body?.userId || 'unknown';
                        return `reset:${request.ip}:${userId}`;
                    }
                }
            }
        },
        resetPasswordHandler
    );
};
