import { RouteHandler } from "fastify";
import { AddPhoneInput } from "../schemas";
import { addPhoneToUser } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
    Body: AddPhoneInput
}> {}

export const addPhoneHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const result = await addPhoneToUser(userId, request.body.phone);

        return reply.send({
            success: true,
            msg: "Código OTP enviado. Verifica tu teléfono.",
            data: result
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "agregar teléfono");
    }
};
