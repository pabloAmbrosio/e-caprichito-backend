import { FastifyInstance } from "fastify";
import listMyAddressesRoute from "./list-my-addresses.route";
import createAddressRoute from "./create-address.route";
import updateAddressRoute from "./update-address.route";
import deleteAddressRoute from "./delete-address.route";

export const shopAddressRoutes = async (app: FastifyInstance) => {
    app.register(listMyAddressesRoute);
    app.register(createAddressRoute);
    app.register(updateAddressRoute);
    app.register(deleteAddressRoute);
};
