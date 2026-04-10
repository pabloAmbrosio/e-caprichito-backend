import { FastifyInstance } from "fastify";
import { deleteAddressHandler } from "../../handlers";
import { AddressIdInput, AddressIdSchema } from "../../schemas";
import { ADDRESS_URL } from "../../constants";

const schema = {
    params: AddressIdSchema,
};

export default (app: FastifyInstance) => {
    app.delete<{ Params: AddressIdInput }>(
        `${ADDRESS_URL}/:addressId`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        deleteAddressHandler,
    );
};
