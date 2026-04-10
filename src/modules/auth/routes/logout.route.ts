import { FastifyInstance } from "fastify";
import { logoutHandler } from "../handlers";
import { AUTH_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${AUTH_URL}/logout`,
        logoutHandler
    );
};
