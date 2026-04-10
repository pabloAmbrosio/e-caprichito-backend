import { db } from "../../../../lib/prisma";
import { findShipmentOrFail } from "../../helpers";

export async function getShipmentDetailService(shipmentId: string) {
    const data = await findShipmentOrFail(db, shipmentId);

    return { msg: "Detalle del envio", data };
}
