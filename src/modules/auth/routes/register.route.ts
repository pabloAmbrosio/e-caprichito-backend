import { FastifyInstance } from "fastify";
import { registerHandler } from "../handlers";
import { RegisterInput, RegisterSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body : RegisterInput
}

const schema = {
    body : RegisterSchema
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/register`,
        { schema },
        registerHandler
    );
};
