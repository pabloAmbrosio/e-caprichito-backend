import type { DbClientOrTx } from "../../../lib/prisma";
import { AddressNotFoundError } from "../errors";
import { addressOwnershipSelect } from "../address.selects";
export async function findAddressOrFail(db: DbClientOrTx, addressId: string) {
    const address = await (db as any).address.findUnique({
        where: { id: addressId },
        select: addressOwnershipSelect,
    });

    if (!address) throw new AddressNotFoundError(addressId);

    return address as { id: string; userId: string; isDefault: boolean };
}
