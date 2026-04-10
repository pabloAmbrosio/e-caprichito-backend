import { FastifyInstance } from "fastify";
import { deleteCartItemHandler } from "../../../handlers";
import { CartItemInput, CartItemSchema } from "../../../schemas";
import { CART_ITEMS_URL } from "../../../constants";

const schema = {
    params : CartItemSchema
}

export default (app: FastifyInstance) => {
    app.delete<{Params: CartItemInput}>(
        `${CART_ITEMS_URL}/:productId`,
        {
            preHandler: [app.authenticate],
            schema
        },
        deleteCartItemHandler
    );
};
