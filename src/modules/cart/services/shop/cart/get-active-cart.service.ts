import { db } from "../../../../../lib/prisma"
import { cartSelect } from "../../../cart.selects"



export const getActiveCartService = async (customerId : string) => {

    const user = await db.user.findUnique({
        where: { id: customerId },
        select: {
            activeCart: {
                select: cartSelect
            }
        }
    });

    return {
        message: "carrito obtenido correctamente",
        data: user?.activeCart || null,
    };
}
