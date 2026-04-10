import { FastifyInstance } from "fastify";
import { listCartsHandler } from "../../handlers";
import { ListCartsInput, ListCartsSchema } from "../../schemas";
import { CARTS_URL } from "../../constants";

interface IGet { Querystring: ListCartsInput }
const schema = { querystring: ListCartsSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        CARTS_URL,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN", "MANAGER"])],
            schema,
        },
        listCartsHandler
    );
};
