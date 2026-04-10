import { db } from "../../../../lib/prisma";
import type { Prisma, DeliveryType } from "../../../../lib/prisma";
import type { CheckoutInput, CheckoutResult, ServiceResult } from "../types";
import { getCartOrFail } from "../helpers/get-cart-or-fail";
import { createOrderRecord } from "../helpers/create-order-record";
import { reserveInventory } from "../helpers/reserve-inventory";
import { rotateCart } from "../helpers/rotate-cart";
import { buildExpiresAt } from "../helpers/build-expires-at";
import { ORDER_EXPIRATION_MINUTES } from "../../constants";
import {
  createShipmentForOrder,
  calculateDeliveryFee,
  AddressRequiredError,
  DeliveryNotAvailableError,
} from "../../adapters";
import { CodRequiresHomeDeliveryError } from "../../errors";

export async function createOrderFromCartService(
  input: CheckoutInput,
): Promise<ServiceResult<CheckoutResult>> {
  const { userId, addressId, discountTotalInCents, expirationMinutes, paymentMethod } = input;

  const isCod = paymentMethod === 'CASH_ON_DELIVERY';

  // COD orders no expiran — el dueño controla cuándo entrega
  const expiresAt = isCod
    ? null
    : buildExpiresAt(expirationMinutes ?? ORDER_EXPIRATION_MINUTES);

  let addressSnapshot: Prisma.InputJsonValue | null = null;
  let deliveryType: DeliveryType = "PICKUP";
  let deliveryFee = 0;

  // ── 1. Si hay dirección → calcular fee y tipo de envío ──
  if (addressId) {
    const address = await db.address.findUnique({
      where: { id: addressId },
      select: {
        label: true,
        formattedAddress: true,
        details: true,
        lat: true,
        lng: true,
        userId: true,
      },
    });

    if (!address || address.userId !== userId) {
      throw new AddressRequiredError();
    }

    const lat = Number(address.lat);
    const lng = Number(address.lng);

    const feeResult = calculateDeliveryFee(lat, lng);

    if (!feeResult.available) {
      throw new DeliveryNotAvailableError();
    }

    deliveryType = feeResult.deliveryType;
    deliveryFee = feeResult.fee;

    addressSnapshot = {
      label: address.label,
      formattedAddress: address.formattedAddress,
      details: address.details,
      lat,
      lng,
    };
  }

  // ── 1b. COD requiere HOME_DELIVERY ──
  if (isCod && deliveryType !== 'HOME_DELIVERY') {
    throw new CodRequiresHomeDeliveryError();
  }

  // ── 2. Transacción: crear orden + shipment + reservar inventario + rotar carrito ──
  const data = await db.$transaction(async (tx) => {
    const cart = await getCartOrFail(tx, userId);

    const order = await createOrderRecord(
      tx,
      userId,
      cart.items,
      discountTotalInCents,
      expiresAt,
      addressSnapshot,
    );

    const shipment = await createShipmentForOrder(tx, {
      orderId: order.id,
      addressId,
      type: deliveryType,
      deliveryFee,
    });

    await reserveInventory(tx, cart.items);
    await rotateCart(tx, userId, cart.id);

    // ── Calcular totales ──
    const itemsWithPrices = await tx.orderItem.findMany({
      where: { orderId: order.id },
      select: {
        quantity: true,
        product: { select: { priceInCents: true } },
      },
    });

    const subtotal = itemsWithPrices.reduce(
      (sum, item) => sum + item.product.priceInCents * item.quantity,
      0,
    );
    const totalDiscount = discountTotalInCents ?? 0;
    const total = subtotal - totalDiscount + deliveryFee;

    // ── 3. COD: crear payment + confirmar orden + avanzar shipment ──
    let paymentData: CheckoutResult['payment'] | undefined;

    if (isCod) {
      const codPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          customerId: userId,
          method: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          amount: total,
          currency: 'MXN',
          providerData: { type: 'CASH_ON_DELIVERY' },
        },
        select: { id: true, method: true, status: true, amount: true },
      });

      // Confirmar orden (skip del flujo manual de payment)
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED', expiresAt: null },
      });

          await tx.shipment.update({
        where: { id: shipment.id },
        data: { status: 'PREPARING' },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: 'PREPARING',
          note: 'Pago contra entrega — preparación iniciada',
        },
      });

      paymentData = {
        id: codPayment.id,
        method: codPayment.method,
        status: codPayment.status,
        amount: codPayment.amount,
      };
    }

    return {
      orderId: order.id,
      status: isCod ? 'CONFIRMED' : order.status,
      itemCount: cart.items.length,
      expiresAt: isCod ? null : order.expiresAt,
      deliveryFee,
      subtotal,
      totalDiscount,
      total,
      shipment: {
        id: shipment.id,
        type: shipment.type,
        status: isCod ? 'PREPARING' : shipment.status,
      },
      ...(paymentData && { payment: paymentData }),
    };
  });

  const msg = isCod
    ? "Orden creada con pago contra entrega"
    : "Orden creada exitosamente";

  return { msg, data };
}
