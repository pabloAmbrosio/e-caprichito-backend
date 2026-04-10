import { RouteHandler } from "fastify";
import { CheckIdentifierInput } from "../schemas";
import { handleAuthError } from "../errors/handle-auth.errors";
import { checkIdentifierExists } from "../services";

interface Handler extends RouteHandler<{
    Body: CheckIdentifierInput
}> {}

export const checkIdentifierHandler: Handler = async (request, reply) => {
    try {
        const exists = await checkIdentifierExists(request.body.identifier);

        return reply.send({
            success: true,
            data: { exists },
        });
    } catch (error) {
        return handleAuthError(error, reply, request, "verificar identificador");
    }
};
