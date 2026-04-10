import { FastifyInstance } from "fastify";
import { getShipmentDetailHandler } from "../../handlers";
import { ShipmentIdInput, ShipmentIdSchema } from "../../schemas";
import { BACKOFFICE_SHIPMENT_URL } from "../../constants";

const schema = { params: ShipmentIdSchema };

export default (app: FastifyInstance) => {
    app.get<{ Params: ShipmentIdInput }>(
        `${BACKOFFICE_SHIPMENT_URL}/:shipmentId`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        getShipmentDetailHandler,
    );
};
