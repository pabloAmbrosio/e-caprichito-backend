import { RouteHandler } from "fastify";
import { VerifyPhoneInput } from "../schemas";
import { verifyPhoneNumber } from "../services";
import { createRefreshTokenForUser, mapUserToPayload } from "../services/token";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
    Body: VerifyPhoneInput
}> {}

export const verifyPhoneHandler: Handler = async (request, reply) => {
    try {
        const user = await verifyPhoneNumber(request.body.userId, request.body.code);

        const payload = mapUserToPayload(user);

        const accessToken = request.server.jwt.sign(payload);
        const refreshToken = await createRefreshTokenForUser(user.id);

        reply.setRefreshToken(refreshToken);
        

        return reply.send({
            success: true,
            msg: "Teléfono verificado exitosamente",
            data: {user, accessToken}
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "verificar teléfono");
    }
};
