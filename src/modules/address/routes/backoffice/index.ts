import { FastifyInstance } from "fastify";
import listUserAddressesRoute from "./list-user-addresses.route";

export const backofficeAddressRoutes = async (app: FastifyInstance) => {
    app.register(listUserAddressesRoute);
};
