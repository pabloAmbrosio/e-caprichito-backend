import { FastifyInstance } from "fastify";
import { updateShipmentHandler } from "../../handlers";
import { ShipmentIdInput, UpdateShipmentBody, ShipmentIdSchema, UpdateShipmentSchema } from "../../schemas";
import { BACKOFFICE_SHIPMENT_URL } from "../../constants";

const schema = {
    params: ShipmentIdSchema,
    body: UpdateShipmentSchema,
};

export default (app: FastifyInstance) => {
    app.patch<{ Params: ShipmentIdInput; Body: UpdateShipmentBody }>(
        `${BACKOFFICE_SHIPMENT_URL}/:shipmentId`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        updateShipmentHandler,
    );
};
