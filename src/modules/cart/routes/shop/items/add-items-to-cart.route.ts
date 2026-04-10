import { FastifyInstance } from "fastify";
import { addItemsToCartHandler } from "../../../handlers";
import { CreateCartItemsInput, CreateCartItemsSchema } from "../../../schemas";
import { CART_ITEMS_URL } from "../../../constants";

const schema = {
    body: CreateCartItemsSchema,
};

export default (app: FastifyInstance) => {
    app.post<{ Body: CreateCartItemsInput }>(
        `${CART_ITEMS_URL}/bulk`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        addItemsToCartHandler,
    );
};
