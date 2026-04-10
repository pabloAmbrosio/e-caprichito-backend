import { FastifyInstance } from "fastify";
import { createAddressHandler } from "../../handlers";
import { CreateAddressInput, CreateAddressSchema } from "../../schemas";
import { ADDRESS_URL } from "../../constants";

const schema = {
    body: CreateAddressSchema,
};

export default (app: FastifyInstance) => {
    app.post<{ Body: CreateAddressInput }>(
        ADDRESS_URL,
        {
            preHandler: [app.authenticate],
            schema,
        },
        createAddressHandler,
    );
};
