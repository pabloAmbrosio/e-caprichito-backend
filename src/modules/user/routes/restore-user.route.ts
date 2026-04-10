import { FastifyInstance } from 'fastify';
import { restoreUserHandler } from '../handlers';
import { UserIdInput, userIdSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IRestore { Params: UserIdInput }
const schema = { params: userIdSchema };

export default (app: FastifyInstance) => {
    app.patch<IRestore>(`${USER_URL}/:id/restore`, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN'])
        ],
        schema
    }, restoreUserHandler);
};
