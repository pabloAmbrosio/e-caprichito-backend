import { FastifyInstance } from 'fastify';

import createUserRoute from './create-user.route';
import listUsersRoute from './list-users.route';
import getUserByIdRoute from './get-user-by-id.route';
import updateUserRoute from './update-user.route';
import deleteUserRoute from './delete-user.route';
import restoreUserRoute from './restore-user.route';

export const backofficeUserRoutes = async (fastify: FastifyInstance) => {
    fastify.register(createUserRoute);
    fastify.register(listUsersRoute);
    fastify.register(getUserByIdRoute);
    fastify.register(updateUserRoute);
    fastify.register(deleteUserRoute);
    fastify.register(restoreUserRoute);
};
