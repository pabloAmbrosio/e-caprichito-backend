import { db } from "../../../../lib/prisma";
import { addressSelect } from "../../address.selects";
import type { CreateAddressInput } from "../../schemas";
import { assertAddressLimit } from "../../helpers/assert-address-limit";
import { ensureSingleDefault } from "../../helpers/ensure-single-default";

export async function createAddressService(userId: string, input: CreateAddressInput) {
    const data = await db.$transaction(async (tx) => {
        await assertAddressLimit(tx, userId);

        const count = await tx.address.count({
            where: { userId, deletedAt: null },
        });

        const isDefault = count === 0 ? true : (input.isDefault ?? false);

        if (isDefault) {
            await ensureSingleDefault(tx, userId);
        }

        return tx.address.create({
            data: {
                userId,
                label: input.label,
                formattedAddress: input.formattedAddress,
                details: input.details,
                lat: input.lat,
                lng: input.lng,
                isDefault,
            },
            select: addressSelect,
        });
    });

    return { msg: "Direccion creada", data };
}
