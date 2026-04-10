import { FastifyInstance } from "fastify";
import { getMyOrdersHandler } from "../../handlers";
import { ShopOrderPaginationInput, ShopOrderPaginationSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";
interface IGet { Querystring: ShopOrderPaginationInput }
const schema = { querystring: ShopOrderPaginationSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        ORDER_URL,
        {
            preHandler: [app.authenticate],
            schema,
        },
        getMyOrdersHandler
    );
};
