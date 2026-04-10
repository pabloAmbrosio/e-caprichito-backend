import { RouteHandler } from 'fastify';
import { UserIdInput } from '../schemas';
import { restoreUserService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Params: UserIdInput }> {}

export const restoreUserHandler: Handler = async (request, reply) => {
    try {
        const requestingUser = request.user;

        const { data, msg } = await restoreUserService({ userId: request.params.id, requestingUserId: requestingUser.userId });

        return reply.status(200).send({ success: true, msg, data });
    } catch (error) {
        return handleUserError(error, reply, request, 'restaurar usuario');
    }
};
