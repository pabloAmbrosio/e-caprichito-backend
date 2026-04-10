import { FastifyInstance } from "fastify";
import { listAbandonedCartsHandler } from "../../handlers";
import { ListAbandonedCartsInput, ListAbandonedCartsSchema } from "../../schemas";
import { CARTS_URL } from "../../constants";

interface IGet { Querystring: ListAbandonedCartsInput }
const schema = { querystring: ListAbandonedCartsSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        `${CARTS_URL}/abandoned`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN", "MANAGER"])],
            schema,
        },
        listAbandonedCartsHandler
    );
};
