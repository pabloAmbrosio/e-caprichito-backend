import { FastifyInstance } from "fastify";
import { getPaymentInfoHandler } from "../../handlers";
import { OrderIdSchema, OrderIdInput } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IGet { Params: OrderIdInput }
const schema = { params: OrderIdSchema };

export default (app: FastifyInstance) => {
    app.get<IGet>(
        `${ORDER_URL}/:orderId/payment-info`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        getPaymentInfoHandler
    );
};
