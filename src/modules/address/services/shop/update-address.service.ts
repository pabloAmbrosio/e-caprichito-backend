import { db } from "../../../../lib/prisma";
import { addressSelect } from "../../address.selects";
import type { UpdateAddressInput } from "../../schemas";
import { findAddressOrFail } from "../../helpers/find-address-or-fail";
import { assertAddressOwner } from "../../helpers/assert-address-owner";
import { assertNotInActiveShipment } from "../../helpers/assert-not-in-active-shipment";
import { ensureSingleDefault } from "../../helpers/ensure-single-default";
import { LastDefaultError } from "../../errors";

export async function updateAddressService(userId: string, addressId: string, input: UpdateAddressInput) {
    const data = await db.$transaction(async (tx) => {
        const address = await findAddressOrFail(tx, addressId);
        assertAddressOwner(userId, address);
        await assertNotInActiveShipment(tx, addressId);

        if (input.isDefault === false && address.isDefault) {
            const otherDefaults = await tx.address.count({
                where: { userId, isDefault: true, deletedAt: null, id: { not: addressId } },
            });
            if (otherDefaults === 0) throw new LastDefaultError();
        }

        if (input.isDefault === true) {
            await ensureSingleDefault(tx, userId, addressId);
        }

        return tx.address.update({
            where: { id: addressId },
            data: input,
            select: addressSelect,
        });
    });

    return { msg: "Direccion actualizada", data };
}
