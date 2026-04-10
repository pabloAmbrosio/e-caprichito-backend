import { FastifyInstance } from "fastify";
import createOrderRoute from "./create-order.route";
import getMyOrdersRoute from "./get-my-orders.route";
import cancelOrderRoute from "./cancel-order.route";
import getOrderDetailRoute from "./get-order-detail.route";
import getPaymentInfoRoute from "./get-payment-info.route";

export const shopOrderRoutes = async (app: FastifyInstance) => {
    app.register(createOrderRoute);
    app.register(getMyOrdersRoute);
    app.register(cancelOrderRoute);
    app.register(getOrderDetailRoute);
    app.register(getPaymentInfoRoute);
};
