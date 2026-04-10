import { FastifyInstance } from "fastify";
import listOrdersRoute from "./list-orders.route";
import orderSummaryRoute from "./order-summary.route";
import getOrderByIdRoute from "./get-order-by-id.route";
import cancelOrderRoute from "./cancel-order.route";

export const backofficeOrderRoutes = async (app: FastifyInstance) => {
    app.register(listOrdersRoute);         // GET  /api/backoffice/order
    app.register(orderSummaryRoute);       // GET  /api/backoffice/order/summary
    app.register(getOrderByIdRoute);       // GET  /api/backoffice/order/:orderId
    app.register(cancelOrderRoute);        // PATCH /api/backoffice/order/:orderId/cancel
};
