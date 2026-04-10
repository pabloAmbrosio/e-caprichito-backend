import { RouteHandler } from 'fastify';
import { UserIdInput } from '../schemas';
import { getUserByIdService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Params: UserIdInput }> {}

export const getUserByIdHandler: Handler = async (request, reply) => {
    try {

        const { data, msg } = await getUserByIdService(request.params.id);

        return reply.status(200).send({ success: true, msg, data });
    } catch (error) {
        return handleUserError(error, reply, request, 'obtener usuario');
    }
};
