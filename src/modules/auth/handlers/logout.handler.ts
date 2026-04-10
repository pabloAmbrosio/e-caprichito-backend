import { RouteHandler } from "fastify";
import { logoutUser } from "../services";

export const logoutHandler: RouteHandler = async (request, reply) => {
    try {
        const refreshToken = request.cookies.refresh_token;

        if (refreshToken) {
            await logoutUser(refreshToken);
        }

    } catch (error) {

        request.log.error({ err: error }, 'Error en logout (no afecta respuesta al usuario)');

    } finally {
        reply.clearRefreshToken();
        return reply.send({
            success: true,
            msg: "Sesion cerrada"
        });
    }
};
