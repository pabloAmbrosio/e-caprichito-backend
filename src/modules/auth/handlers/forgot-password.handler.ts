import { RouteHandler } from "fastify";
import { ForgotPasswordInput } from "../schemas";
import { forgotPassword } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
  Body: ForgotPasswordInput
}> {}

export const forgotPasswordHandler: Handler = async (request, reply) => {
  try {
    const result = await forgotPassword(request.body.identifier);

    return reply.send({
      success: true,
      msg: "Código de verificación enviado",
      data: result
    });
  } catch (error) {
    return handleAuthError(error, reply, request, "solicitar recuperación de contraseña");
  }
};
