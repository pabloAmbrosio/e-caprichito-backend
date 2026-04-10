import { FastifyInstance } from "fastify";
import listShipmentsRoute from "./list-shipments.route";
import getShipmentDetailRoute from "./get-shipment-detail.route";
import advanceShipmentRoute from "./advance-shipment.route";
import failShipmentRoute from "./fail-shipment.route";
import updateShipmentRoute from "./update-shipment.route";

export const backofficeShipmentRoutes = async (app: FastifyInstance) => {
    app.register(listShipmentsRoute);         // GET   /api/backoffice/shipments
    app.register(getShipmentDetailRoute);     // GET   /api/backoffice/shipments/:shipmentId
    app.register(advanceShipmentRoute);       // PATCH /api/backoffice/shipments/:shipmentId/advance
    app.register(failShipmentRoute);          // PATCH /api/backoffice/shipments/:shipmentId/fail
    app.register(updateShipmentRoute);        // PATCH /api/backoffice/shipments/:shipmentId
};
