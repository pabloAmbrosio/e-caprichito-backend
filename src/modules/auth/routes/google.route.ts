import { FastifyInstance } from "fastify";
import { AUTH_URL } from "../constants";

export default (app: FastifyInstance) => {
    // Fallback: @fastify/oauth2 normally intercepts this route and redirects to Google
    app.get(
        `${AUTH_URL}/google`,
        async (request, reply) => {
            return reply.send({
                success: false,
                msg: 'OAuth plugin no configurado correctamente'
            });
        }
    );
};
