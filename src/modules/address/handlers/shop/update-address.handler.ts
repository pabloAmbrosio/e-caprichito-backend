import { RouteHandler } from "fastify";
import { updateAddressService } from "../../services/shop";
import { AddressIdInput, UpdateAddressInput } from "../../schemas";
import { handleAddressError } from "../../errors/handle-address.errors";

interface Handler extends RouteHandler<{
    Params: AddressIdInput;
    Body: UpdateAddressInput;
}> {}

export const updateAddressHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { addressId } = request.params;
        const { msg, data } = await updateAddressService(userId, addressId, request.body);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleAddressError(error, reply, request, "actualizar direccion");
    }
};
