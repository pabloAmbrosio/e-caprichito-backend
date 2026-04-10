import { RouteHandler } from "fastify";
import { deleteAddressService } from "../../services/shop";
import { AddressIdInput } from "../../schemas";
import { handleAddressError } from "../../errors/handle-address.errors";

interface Handler extends RouteHandler<{
    Params: AddressIdInput;
}> {}

export const deleteAddressHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { addressId } = request.params;
        const { msg } = await deleteAddressService(userId, addressId);

        return reply.send({ success: true, msg });
    } catch (error) {
        return handleAddressError(error, reply, request, "eliminar direccion");
    }
};
