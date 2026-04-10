import { FastifyInstance } from "fastify";
import { addItemToCartHandler } from "../../../handlers";
import { CreateCartItemInput, CreateCartItemSchema } from "../../../schemas";
import { CART_ITEMS_URL } from "../../../constants";


const schema = {
    body : CreateCartItemSchema
}

export default (app: FastifyInstance) => {
    app.post<{Body: CreateCartItemInput}>(
        CART_ITEMS_URL,
        {
            preHandler: [app.authenticate],
            schema
        },
        addItemToCartHandler
    );
};
