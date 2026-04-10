import type { DbClientOrTx } from "../../../lib/prisma";
import { AddressLimitError } from "../errors";
import { MAX_ADDRESSES_PER_USER } from "../constants";
export async function assertAddressLimit(db: DbClientOrTx, userId: string) {
    const count = await (db as any).address.count({
        where: { userId, deletedAt: null },
    });

    if (count >= MAX_ADDRESSES_PER_USER) {
        throw new AddressLimitError();
    }
}
