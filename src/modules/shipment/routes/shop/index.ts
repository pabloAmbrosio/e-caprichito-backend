import { FastifyInstance } from "fastify";
import calculateFeeRoute from "./calculate-fee.route";
import getTrackingRoute from "./get-tracking.route";

export const shopShipmentRoutes = async (app: FastifyInstance) => {
    app.register(calculateFeeRoute);
    app.register(getTrackingRoute);
};
