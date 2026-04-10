import { db } from "../../../../lib/prisma";
import type { CalculateFeeBody } from "../../schemas";
import { calculateDeliveryFee } from "../../helpers";
import { AddressRequiredError } from "../../errors";

export async function calculateFeeService(userId: string, input: CalculateFeeBody) {

    const address = await db.address.findUnique({
        where: { id: input.addressId },
        select: { lat: true, lng: true, userId: true },
    });

    if (!address || address.userId !== userId) {
        throw new AddressRequiredError();
    }

    const lat = Number(address.lat);
    const lng = Number(address.lng);

    const result = calculateDeliveryFee(lat, lng);

    return { msg: "Calculo de tarifa", data: result };
}
