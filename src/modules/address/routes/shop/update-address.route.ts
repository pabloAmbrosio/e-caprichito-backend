import { FastifyInstance } from "fastify";
import { updateAddressHandler } from "../../handlers";
import { AddressIdInput, AddressIdSchema, UpdateAddressInput, UpdateAddressSchema } from "../../schemas";
import { ADDRESS_URL } from "../../constants";

const schema = {
    params: AddressIdSchema,
    body: UpdateAddressSchema,
};

export default (app: FastifyInstance) => {
    app.patch<{ Params: AddressIdInput; Body: UpdateAddressInput }>(
        `${ADDRESS_URL}/:addressId`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        updateAddressHandler,
    );
};
