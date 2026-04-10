import { FastifyInstance } from "fastify";
import { getCartByIdHandler } from "../../handlers";
import { CARTS_URL } from "../../constants";

export default (app: FastifyInstance) => {
    app.get<{ Params: { cartId: string } }>(
        `${CARTS_URL}/:cartId`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN","MANAGER"])],
        },
        getCartByIdHandler
    );
};
