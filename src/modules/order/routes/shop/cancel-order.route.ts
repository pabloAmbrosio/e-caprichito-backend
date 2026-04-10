import { FastifyInstance } from "fastify";
import { cancelOrderHandler } from "../../handlers";
import { OrderIdInput, OrderIdSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IPatch {
    Params: OrderIdInput
}

const schema = {
    params: OrderIdSchema
}

export default (app: FastifyInstance) => {
    app.patch<IPatch>(
        `${ORDER_URL}/:orderId/cancel`,
        {
            preHandler: [app.authenticate],
            schema
        },
        cancelOrderHandler
    );
};
