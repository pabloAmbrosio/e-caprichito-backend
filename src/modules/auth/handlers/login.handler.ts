import { RouteHandler } from "fastify";
import { LoginInput } from "../schemas";
import { handleAuthError } from "../errors/handle-auth.errors";
import {
    createRefreshToken,
    getRefreshToken,
    loginUser,
    mapUserToPayload,
    revokeAllTokens,
    revokeTokenAndRenew
} from "../services";
import { SuspiciousTokenError } from "../errors";

interface Handler extends RouteHandler<{
    Body: LoginInput
}> {}

export const loginHandler: Handler = async (request, reply) => {
    try {

        const user = await loginUser(request.body.identifier, request.body.password);

        const oldToken = request.cookies.refresh_token;

        if (oldToken) {
            const existingRefreshToken = await getRefreshToken(oldToken);

            if (!existingRefreshToken || existingRefreshToken.revoked) {
                await revokeAllTokens(user.id);
                throw new SuspiciousTokenError()
            }

            const newToken = await revokeTokenAndRenew(user.id, oldToken);
            
            reply.setRefreshToken(newToken.token);
        } else {
            const refreshToken = await createRefreshToken(user);
            reply.setRefreshToken(refreshToken);
        }

        const accessToken = request.server.jwt.sign(
            mapUserToPayload(user)
        );

        return reply.send({
            success: true,
            msg: "Login exitoso",
            data: {
                user,
                accessToken
            }
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "iniciar sesión");
    }
};
