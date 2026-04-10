import { FastifyInstance } from 'fastify';
import { createUserHandler } from '../handlers';
import { CreateUserInput, createUserSchema } from '../schemas';
import { USER_URL } from '../constants';

interface IPost { Body: CreateUserInput }
const schema = { body: createUserSchema };

export default (app: FastifyInstance) => {
    app.post<IPost>(USER_URL, {
        preHandler: [
            app.authenticate,
            app.requireRoles(['OWNER', 'ADMIN'])
        ],
        schema
    }, createUserHandler);
};
