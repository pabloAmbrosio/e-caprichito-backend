import { RouteHandler } from "fastify";
import { handleAuthError } from "../errors/handle-auth.errors";
import { getRefreshToken, mapUserToPayload, revokeAllTokens, revokeTokenAndRenew } from "../services/token";
import { ExpiredRefreshTokenError, MissingRefreshTokenError, SuspiciousTokenError } from "../errors";

export const refreshTokenHandler: RouteHandler = async (request, reply) => {
    try {
        const refreshToken = request.cookies.refresh_token;

        request.log.info({ hasRefreshToken: !!refreshToken, hasUser: !!request.user }, 'Refresh token: inicio');

        if (!refreshToken) {
            throw new MissingRefreshTokenError();
        }

        const existingRefreshToken = await getRefreshToken(refreshToken);

        request.log.info({ tokenFound: !!existingRefreshToken }, 'Refresh token: resultado Redis');

        if (
            !existingRefreshToken ||
            existingRefreshToken.revoked) {
            const userId = existingRefreshToken?.user?.id ?? request.user?.userId;
            request.log.warn({ userId, revoked: existingRefreshToken?.revoked }, 'Refresh token: token inválido o revocado');
            if (userId) {
                await revokeAllTokens(userId);
            }
            throw new SuspiciousTokenError();
        }
        
        if (existingRefreshToken.expiresAt < new Date()) {
            throw new ExpiredRefreshTokenError();
        }

        const payload = mapUserToPayload(existingRefreshToken.user);
        const newAccessToken = request.server.jwt.sign(payload);

        // Generate new access token before revoking old one to ensure validity
        const { token: newRefreshToken } = await revokeTokenAndRenew(existingRefreshToken.user.id, existingRefreshToken.token);
        reply.setRefreshToken(newRefreshToken);

        return reply.send({
            success: true,
            msg: "Token renovado exitosamente",
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        reply.clearRefreshToken();
        return handleAuthError(error, reply, request, "renovar token");
    }
};
