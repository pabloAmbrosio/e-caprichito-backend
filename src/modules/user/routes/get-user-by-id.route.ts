import { FastifyInstance } from 'fastify';
import { getUserByIdHandler } from '../handlers';
import { UserIdInput, userIdSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IGet { Params: UserIdInput }
const schema = { params: userIdSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(`${USER_URL}/:id`, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN', 'MANAGER'])
        ],
        schema
    }, getUserByIdHandler);
};
