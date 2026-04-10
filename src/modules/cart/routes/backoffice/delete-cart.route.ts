import { FastifyInstance } from "fastify";
import { deleteCartByIdHandler } from "../../handlers";
import { CARTS_URL } from "../../constants";

export default (app: FastifyInstance) => {
    app.delete<{ Params: { cartId: string } }>(
        `${CARTS_URL}/:cartId`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN", "MANAGER"])],
        },
        deleteCartByIdHandler
    );
};
