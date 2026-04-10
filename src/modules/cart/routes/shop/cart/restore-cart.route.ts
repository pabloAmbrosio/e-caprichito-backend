import { FastifyInstance } from "fastify";
import { CARTS_URL } from "../../../constants";
import { restoreCartHandler } from "../../../handlers";
import { RestoreCartInput, RestoreCartSchema } from "../../../schemas";

const schema = {
    body : RestoreCartSchema
}

interface IPost {
    Body : RestoreCartInput
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${CARTS_URL}/:cartId/restore`,
        {
            preHandler: [app.authenticate],
            schema
        },
        restoreCartHandler
    );
}
