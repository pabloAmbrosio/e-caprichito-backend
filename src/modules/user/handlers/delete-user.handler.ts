import { RouteHandler } from 'fastify';
import { UserIdInput } from '../schemas';
import { deleteUserService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Params: UserIdInput }> {}

export const deleteUserHandler: Handler = async (request, reply) => {
    try {
        const requestingUser = request.user;

        const { data, msg } = await deleteUserService({ userId: request.params.id, requestingUserId: requestingUser.userId });

        return reply.status(200).send({ success: true, msg, data });
    } catch (error) {
        return handleUserError(error, reply, request, 'eliminar usuario');
    }
};
