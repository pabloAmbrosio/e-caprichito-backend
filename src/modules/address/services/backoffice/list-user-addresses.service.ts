import { db } from "../../../../lib/prisma";
import { addressSelect } from "../../address.selects";

export async function listUserAddressesService(userId: string) {
    const data = await db.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: addressSelect,
    });

    return { msg: "Direcciones del usuario obtenidas", data };
}
