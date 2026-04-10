import { FastifyInstance } from "fastify";
import { addPhoneHandler } from "../handlers";
import { AddPhoneInput, AddPhoneSchema } from "../schemas";
import { AUTH_URL } from "../constants";

interface IPost {
    Body : AddPhoneInput
}

const schema = {
    body : AddPhoneSchema
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${AUTH_URL}/add-phone`,
        {
            preHandler: [app.authenticate],
            schema
        },
        addPhoneHandler
    );
};
