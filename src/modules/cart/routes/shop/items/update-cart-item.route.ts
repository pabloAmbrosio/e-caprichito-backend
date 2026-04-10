import { FastifyInstance } from "fastify";
import { updateCartItemHandler } from "../../../handlers";
import { UpdateCartItemInput, CartItemInput, UpdateCartItemSchema, CartItemSchema } from "../../../schemas";
import { CART_ITEMS_URL } from "../../../constants";

interface IPatch {
    Body : UpdateCartItemInput,
    Params : CartItemInput
}

const schema = {
    body : UpdateCartItemSchema,
    params : CartItemSchema
}

export default (app: FastifyInstance) => {
    app.patch<IPatch>(
        `${CART_ITEMS_URL}/:productId`,
        {
            preHandler: [app.authenticate],
            schema
        },
        updateCartItemHandler
    );
};
