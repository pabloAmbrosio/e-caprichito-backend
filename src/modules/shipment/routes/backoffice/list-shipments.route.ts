import { FastifyInstance } from "fastify";
import { listShipmentsHandler } from "../../handlers";
import { ListShipmentsQuery, ListShipmentsSchema } from "../../schemas";
import { BACKOFFICE_SHIPMENT_URL } from "../../constants";

const schema = { querystring: ListShipmentsSchema };

export default (app: FastifyInstance) => {
    app.get<{ Querystring: ListShipmentsQuery }>(
        BACKOFFICE_SHIPMENT_URL,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        listShipmentsHandler,
    );
};
