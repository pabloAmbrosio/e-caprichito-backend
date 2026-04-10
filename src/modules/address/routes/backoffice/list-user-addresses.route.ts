import { FastifyInstance } from "fastify";
import { listUserAddressesHandler } from "../../handlers";
import { ListUserAddressesInput, ListUserAddressesSchema } from "../../schemas";
import { ADDRESS_URL } from "../../constants";

interface IGet { Querystring: ListUserAddressesInput }
const schema = { querystring: ListUserAddressesSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        ADDRESS_URL,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        listUserAddressesHandler,
    );
};
