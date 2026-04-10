import { FastifyInstance } from "fastify";
import { listOrdersHandler } from "../../handlers";
import { OrderSearchInput, OrderSearchSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IGet { Querystring: OrderSearchInput }
const schema = { querystring: OrderSearchSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        ORDER_URL,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        listOrdersHandler
    );
};
