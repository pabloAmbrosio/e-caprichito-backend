import { RouteHandler } from "fastify";
import { ChangePasswordInput } from "../schemas/change-password.schema";
import { changePassword } from "../services";
import { handleAuthError } from "../errors/handle-auth.errors";

interface Handler extends RouteHandler<{
  Body: ChangePasswordInput
}> {}

export const changePasswordHandler: Handler = async (
  request, reply
) => {
  try {

    const { userId } = request.user;

    const {
        currentPassword,
        newPassword
    } = request.body;

    await changePassword(
      userId,
      currentPassword,
        newPassword
    );

    return reply.send({
      success: true,
      msg: "Contrasena actualizada exitosamente"
    });
  } catch (error) {
    return handleAuthError(error, reply,request, 'changePasswordHandler');
  }
};