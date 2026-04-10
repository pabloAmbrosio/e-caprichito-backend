import { FastifyInstance } from "fastify";
import { getCartsHistoryHandler } from "../../../handlers";
import { CARTS_URL } from "../../../constants";
import { CartsHistoryPaginationInput, CartsHistoryPaginationSchema } from "../../../schemas/cart/carts-history-pagination.schema";

interface IGet { Querystring: CartsHistoryPaginationInput }
const schema = { querystring: CartsHistoryPaginationSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        `${CARTS_URL}/history`,
        { schema, preHandler: [app.authenticate] },
        getCartsHistoryHandler
    );
};
