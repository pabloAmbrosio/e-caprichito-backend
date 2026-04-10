import { RouteHandler } from 'fastify';
import { UserIdInput, UpdateUserInput } from '../schemas';
import { updateUserService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Params: UserIdInput; Body: UpdateUserInput }> {}

export const updateUserHandler: Handler = async (request, reply) => {
    try {
        const requestingUser = request.user;

        const { data, msg } = await updateUserService({
            userId: request.params.id,
            data: request.body,
            requestingUserId: requestingUser.userId,
            requestingUserRole: requestingUser.adminRole,
        });

        return reply.status(200).send({ success: true, msg, data });
    } catch (error) {
        return handleUserError(error, reply, request, 'actualizar usuario');
    }
};
