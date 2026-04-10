import { FastifyInstance } from 'fastify';
import { updateUserHandler } from '../handlers';
import { UserIdInput, UpdateUserInput, userIdSchema, updateUserSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IPatch { Params: UserIdInput; Body: UpdateUserInput }
const schema = { params: userIdSchema, body: updateUserSchema };

export default (app: FastifyInstance) => {
    app.patch<IPatch>(`${USER_URL}/:id`, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN'])
        ],
        schema
    }, updateUserHandler);
};
