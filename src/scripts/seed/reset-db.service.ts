import { PrismaClient } from "../../lib/prisma";

// Orden: dependientes antes que padres. Cascade maneja hijos automáticamente.
export const resetDB = (db: PrismaClient) => db.$transaction([
    db.user.updateMany({ data: { activeCartId: null } }), // romper ref circular
    db.promotionUsage.deleteMany(),
    db.shipmentEvent.deleteMany(),
    db.shipment.deleteMany(),
    db.payment.deleteMany(),
    db.orderStatusAuditLog.deleteMany(),
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.inventory.deleteMany(),
    db.cartItem.deleteMany(),
    db.cart.deleteMany(),
    db.productLike.deleteMany(),
    db.product.deleteMany(),
    db.abstractProduct.deleteMany(),
    db.category.deleteMany({ where: { parentId: { not: null } } }), // hijas primero
    db.category.deleteMany(),
    db.promotionAction.deleteMany(),
    db.promotionRule.deleteMany(),
    db.promotion.deleteMany(),
    db.address.deleteMany(),
    db.oTPCode.deleteMany(),
    db.user.deleteMany(),
])
