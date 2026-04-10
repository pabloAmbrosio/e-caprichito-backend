import { FastifyInstance } from 'fastify';
import { listUsersHandler } from '../handlers';
import { ListUsersInput, listUsersSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IGet { Querystring: ListUsersInput }
const schema = { querystring: listUsersSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(USER_URL, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN', 'MANAGER'])
        ],
        schema
    }, listUsersHandler);
};
