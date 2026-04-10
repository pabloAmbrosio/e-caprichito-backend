import { RouteHandler } from 'fastify';
import { CreateUserInput } from '../schemas';
import { createUserService } from '../services';
import { handleUserError } from '../errors/handle-user.errors';

interface Handler extends RouteHandler<{ Body: CreateUserInput }> {}

export const createUserHandler: Handler = async (request, reply) => {
    try {

        const { userId } = request.user;

        const { data, msg } = await createUserService({ data: request.body, requestingAdminId: userId });

        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleUserError(error, reply, request, "crear usuario");
    }
};
