import { FastifyInstance } from "fastify";
import { loginHandler } from "../handlers";
import { LoginInput, LoginSchema } from "../schemas";
import { AUTH_URL } from "../constants";
import { AUTH_RATE_LIMIT } from '../../../config/rate-limit.config';

interface IPost {
    Body : LoginInput
}

const schema = {
    body : LoginSchema
}

const config = {
    rateLimit: AUTH_RATE_LIMIT
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/login`,
        { schema , config },
        loginHandler
    );
};
