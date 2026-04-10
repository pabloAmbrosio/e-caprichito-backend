import { FastifyInstance } from "fastify";
import { checkIdentifierHandler } from "../handlers";
import { CheckIdentifierInput, CheckIdentifierSchema } from "../schemas";
import { AUTH_URL } from "../constants";
import { AUTH_RATE_LIMIT } from '../../../config/rate-limit.config';

interface IPost {
    Body: CheckIdentifierInput
}

const schema = {
    body: CheckIdentifierSchema
}

const config = {
    rateLimit: AUTH_RATE_LIMIT
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/check-identifier`,
        { schema, config },
        checkIdentifierHandler
    );
};
