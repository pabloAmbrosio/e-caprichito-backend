import { db } from "../../../../lib/prisma";
import { findAddressOrFail } from "../../helpers/find-address-or-fail";
import { assertAddressOwner } from "../../helpers/assert-address-owner";
import { assertNotInActiveShipment } from "../../helpers/assert-not-in-active-shipment";
import { reassignDefault } from "../../helpers/reassign-default";

export async function deleteAddressService(userId: string, addressId: string) {
    await db.$transaction(async (tx) => {
        const address = await findAddressOrFail(tx, addressId);
        assertAddressOwner(userId, address);
        await assertNotInActiveShipment(tx, addressId);

        await tx.address.update({
            where: { id: addressId },
            data: { deletedAt: new Date(), isDefault: false },
        });

        if (address.isDefault) {
            await reassignDefault(tx, userId);
        }
    });

    return { msg: "Direccion eliminada" };
}
