import { FastifyInstance } from 'fastify';
import { deleteUserHandler } from '../handlers';
import { UserIdInput, userIdSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IDelete { Params: UserIdInput }
const schema = { params: userIdSchema };

export default (app: FastifyInstance) => {
    app.delete<IDelete>(`${USER_URL}/:id`, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN'])
        ],
        schema
    }, deleteUserHandler);
};
