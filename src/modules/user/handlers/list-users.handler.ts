import { RouteHandler } from 'fastify';
import { ListUsersInput } from '../schemas';
import { listUsersService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Querystring: ListUsersInput }> {}

export const listUsersHandler: Handler = async (request, reply) => {
    try {

        const { data, pagination, msg } = await listUsersService(request.query);

        return reply.status(200).send({ success: true, msg, data, pagination });
    } catch (error) {
        return handleUserError(error, reply, request, 'listar usuarios');
    }
};
