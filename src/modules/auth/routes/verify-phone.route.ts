import { FastifyInstance } from "fastify";
import { verifyPhoneHandler } from "../handlers";
import { VerifyPhoneInput, VerifyPhoneSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body : VerifyPhoneInput
}

const schema = {
    body : VerifyPhoneSchema
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/verify-phone`,
        {
            schema,
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: '1 minute',
                    keyGenerator: (request: any) => {
                        const phone = request.body?.userId || 'unknown';
                        return `${request.ip}:${phone}`;
                    }
                }
            }
        },
        verifyPhoneHandler
    );
};
