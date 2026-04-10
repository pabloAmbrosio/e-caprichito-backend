import { RouteHandler } from "fastify";
import { RegisterInput } from "../schemas";
import { createRefreshTokenForUser, mapUserToPayload, register } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
    Body: RegisterInput
}> {}

export const registerHandler: Handler = async (request, reply) => {
    try {
        const user = await register(request.body);
        const payload = mapUserToPayload(user);
        const accessToken = request.server.jwt.sign(payload);
        const refreshToken = await createRefreshTokenForUser(user.id);

        reply.setRefreshToken(refreshToken);
        reply.setTempAccessToken(accessToken);

        return reply.status(201).send({
            success: true,
            msg: "Usuario registrado. Verifica tu teléfono con el código enviado por SMS.",
            data: {
                user,
                accessToken
            }
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "registrar usuario");
    }
};
