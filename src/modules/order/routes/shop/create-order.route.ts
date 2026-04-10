import { FastifyInstance } from "fastify";
import { createOrderHandler } from "../../handlers";
import { CheckoutBody, CheckoutSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";

const schema = { body: CheckoutSchema };

export default (app: FastifyInstance) => {
    app.post<{ Body: CheckoutBody }>(
        ORDER_URL,
        {
            preHandler: [app.authenticate, app.requirePhoneVerified],
            schema,
        },
        createOrderHandler,
    );
};
