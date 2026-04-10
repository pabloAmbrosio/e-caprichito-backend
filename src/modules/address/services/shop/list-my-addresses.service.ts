import { db } from "../../../../lib/prisma";
import { addressSelect } from "../../address.selects";

export async function listMyAddressesService(userId: string) {
    const data = await db.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: addressSelect,
    });

    return { msg: "Direcciones obtenidas", data };
}
