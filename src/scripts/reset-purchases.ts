/**
 * Reset parcial: borra todo lo relacionado con compras para poder hacer
 * pruebas limpias sin inventario reservado ni ordenes muertas.
 *
 * Preserva: usuarios, productos, categorias, promociones.
 * Limpia: ordenes, pagos, envios, carritos, uso de promociones, direcciones.
 * Resetea: Inventory a estado de seed (physicalStock=1, reservedStock=0).
 *
 * Uso:
 *   yarn db:reset:purchases
 */
import 'dotenv/config';
import { db } from '../lib/prisma';
import { cleanupPaymentImages } from './seed/cleanup-cloudinary';

async function main() {
  console.log('🧹 Reseteando datos de compras...');

  const result = await db.$transaction(async (tx) => {
    const shipmentEvents = await tx.shipmentEvent.deleteMany();
    const shipments = await tx.shipment.deleteMany();
    const payments = await tx.payment.deleteMany();
    const auditLogs = await tx.orderStatusAuditLog.deleteMany();
    const orderItems = await tx.orderItem.deleteMany();
    const promotionUsages = await tx.promotionUsage.deleteMany();
    const orders = await tx.order.deleteMany();

    await tx.user.updateMany({
      where: { activeCartId: { not: null } },
      data: { activeCartId: null },
    });
    const cartItems = await tx.cartItem.deleteMany();
    const carts = await tx.cart.deleteMany();

    const addresses = await tx.address.deleteMany();

    const inventory = await tx.inventory.updateMany({
      data: { physicalStock: 1, reservedStock: 0 },
    });

    return {
      shipmentEvents: shipmentEvents.count,
      shipments: shipments.count,
      payments: payments.count,
      auditLogs: auditLogs.count,
      orderItems: orderItems.count,
      orders: orders.count,
      promotionUsages: promotionUsages.count,
      cartItems: cartItems.count,
      carts: carts.count,
      addresses: addresses.count,
      inventoriesReset: inventory.count,
    };
  });

  console.log('✅ Reset completado:');
  console.log(`   ordenes:              ${result.orders}`);
  console.log(`   order items:          ${result.orderItems}`);
  console.log(`   audit logs:           ${result.auditLogs}`);
  console.log(`   pagos:                ${result.payments}`);
  console.log(`   envios:               ${result.shipments}`);
  console.log(`   shipment events:      ${result.shipmentEvents}`);
  console.log(`   promotion usages:     ${result.promotionUsages}`);
  console.log(`   carritos:             ${result.carts}`);
  console.log(`   cart items:           ${result.cartItems}`);
  console.log(`   direcciones:          ${result.addresses}`);
  console.log(`   inventario reseteado:  ${result.inventoriesReset} productos (stock=1, reserved=0)`);

  await cleanupPaymentImages();
}

main()
  .catch((err) => {
    console.error('❌ Reset fallo:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
