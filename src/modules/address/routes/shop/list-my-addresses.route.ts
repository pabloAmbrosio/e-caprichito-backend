import { FastifyInstance } from "fastify";
import { listMyAddressesHandler } from "../../handlers";
import { ADDRESS_URL } from "../../constants";

export default (app: FastifyInstance) => {
    app.get(
        ADDRESS_URL,
        { preHandler: [app.authenticate] },
        listMyAddressesHandler,
    );
};
