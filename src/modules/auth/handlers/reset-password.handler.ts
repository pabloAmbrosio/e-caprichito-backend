import { RouteHandler } from "fastify";
import { ResetPasswordInput } from "../schemas";
import { resetPassword } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
  Body: ResetPasswordInput
}> {}

export const resetPasswordHandler: Handler = async (request, reply) => {
  try {
    const { userId, code, newPassword } = request.body;

    await resetPassword(userId, code, newPassword);

    return reply.send({
      success: true,
      msg: "Contraseña restablecida exitosamente. Inicia sesión con tu nueva contraseña."
    });
  } catch (error) {
    return handleAuthError(error, reply, request, "restablecer contraseña");
  }
};
