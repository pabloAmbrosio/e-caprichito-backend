import { RouteHandler } from "fastify";
import { createAddressService } from "../../services/shop";
import { CreateAddressInput } from "../../schemas";
import { handleAddressError } from "../../errors/handle-address.errors";

interface Handler extends RouteHandler<{
    Body: CreateAddressInput;
}> {}

export const createAddressHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await createAddressService(userId, request.body);

        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleAddressError(error, reply, request, "crear direccion");
    }
};
