import { FastifyInstance } from "fastify";
import { requestOTPHandler } from "../handlers";
import { RequestOTPInput, RequestOTPSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body : RequestOTPInput
}

const schema = {    body : RequestOTPSchema }

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/request-otp`,
        {
            schema,
            config: {
                rateLimit: {
                    max: 3,
                    timeWindow: '1 minute',
                    keyGenerator: (request: any) => {
                        const phone = request.body?.phone || 'unknown';
                        return `${request.ip}:${phone}`;
                    }
                }
            }
        },
        requestOTPHandler
    );
};
