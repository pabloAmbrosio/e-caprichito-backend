import { FastifyInstance } from "fastify";
import { refreshTokenHandler } from "../handlers";
import { AUTH_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${AUTH_URL}/refresh`,
        refreshTokenHandler
    );
};
