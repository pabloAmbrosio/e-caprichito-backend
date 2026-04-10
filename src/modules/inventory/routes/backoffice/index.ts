import { FastifyInstance } from "fastify";
import upsertInventoryRoute from "./upsert-inventory.route";
import getInventoryRoute from "./get-inventory.route";
import listInventoryRoute from "./list-inventory.route";
import reserveStockRoute from "./reserve-stock.route";
import releaseStockRoute from "./release-stock.route";

export const backofficeInventoryRoutes = async (app: FastifyInstance) => {
    app.register(upsertInventoryRoute);
    app.register(getInventoryRoute);
    app.register(listInventoryRoute);
    app.register(reserveStockRoute);
    app.register(releaseStockRoute);
};
