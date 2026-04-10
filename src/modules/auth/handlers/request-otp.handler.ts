import { RouteHandler } from "fastify";
import { RequestOTPInput } from "../schemas";
import { requestOTPForPhone } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
    Body: RequestOTPInput
}> {}

export const requestOTPHandler: Handler = async (request, reply) => {
    try {
        const result = await requestOTPForPhone(request.body.phone);

        return reply.send({
            success: true,
            msg: "Código OTP enviado por SMS",
            data: result
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "enviar OTP");
    }
};
