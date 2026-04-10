import { FastifyInstance } from "fastify";
import { failShipmentHandler } from "../../handlers";
import { ShipmentIdInput, FailShipmentBody, ShipmentIdSchema, FailShipmentSchema } from "../../schemas";
import { BACKOFFICE_SHIPMENT_URL } from "../../constants";

const schema = {
    params: ShipmentIdSchema,
    body: FailShipmentSchema,
};

export default (app: FastifyInstance) => {
    app.patch<{ Params: ShipmentIdInput; Body: FailShipmentBody }>(
        `${BACKOFFICE_SHIPMENT_URL}/:shipmentId/fail`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        failShipmentHandler,
    );
};
