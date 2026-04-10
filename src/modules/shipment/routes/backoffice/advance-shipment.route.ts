import { FastifyInstance } from "fastify";
import { advanceShipmentHandler } from "../../handlers";
import { ShipmentIdInput, AdvanceShipmentBody, ShipmentIdSchema, AdvanceShipmentSchema } from "../../schemas";
import { BACKOFFICE_SHIPMENT_URL } from "../../constants";

const schema = {
    params: ShipmentIdSchema,
    body: AdvanceShipmentSchema,
};

export default (app: FastifyInstance) => {
    app.patch<{ Params: ShipmentIdInput; Body: AdvanceShipmentBody }>(
        `${BACKOFFICE_SHIPMENT_URL}/:shipmentId/advance`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        advanceShipmentHandler,
    );
};
