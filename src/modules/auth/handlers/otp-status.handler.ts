import { RouteHandler } from "fastify";
import { getOTPStatus } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

export const otpStatusHandler: RouteHandler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const result = await getOTPStatus(userId);

        return reply.send({ success: true, data: result });
    } catch (error) {
        return handleAuthError(error, reply, request, "consultar estado OTP");
    }
};
