import { FastifyInstance } from "fastify";
import { googleCallbackHandler } from "../handlers";
import { AUTH_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.get(
        `${AUTH_URL}/google/callback`,
        googleCallbackHandler
    );
};
