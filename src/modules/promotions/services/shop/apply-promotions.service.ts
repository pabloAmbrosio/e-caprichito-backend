/**
 * Servicio puente entre el sistema y el motor de promociones.
 *
 * Recibe los datos del carrito/usuario, construye el PromotionContext,
 * instancia el PromotionEngine, y retorna el resultado de la evaluación.
 *
 * Este servicio es el punto de entrada para cualquier parte del sistema
 * que necesite calcular descuentos (order creation, coupon preview, etc.)
 */
import { db } from '../../../../lib/prisma';
import { PromotionEngine } from '../../engine/promotion-engine';
import type { PromotionContext, CartItemForEngine, EngineResult } from '../../types';

/**
 * Datos necesarios para evaluar las promociones aplicables.
 * Se construye a partir de los datos del carrito y el usuario.
 */
interface ApplyPromotionsInput {
  /** ID del usuario que está comprando */
  readonly userId: string;
  /** Rol de cliente/VIP del usuario (puede ser null) */
  readonly customerRole: string | null;
  /** Items del carrito con datos de producto necesarios para evaluación */
  readonly cartItems: readonly CartItemForEngine[];
  /** Total del carrito en centavos (suma de priceInCents * quantity) */
  readonly cartTotalInCents: number;
  /** Código de cupón ingresado (opcional) */
  readonly couponCode?: string;
}

/**
 * Evalúa las promociones aplicables al carrito/usuario dado.
 *
 * Flujo:
 * 1. Pre-computa si es la primera compra del usuario
 * 2. Construye el PromotionContext completo
 * 3. Instancia el PromotionEngine y ejecuta evaluate()
 * 4. Retorna el resultado con descuentos calculados
 *
 * @param input - Datos del carrito y usuario
 * @returns EngineResult con originalTotal, finalTotal, totalDiscount, appliedPromotions
 */
export const applyPromotionsService = async (input: ApplyPromotionsInput): Promise<EngineResult> => {
  /**
   * Pre-computar si es la primera compra del usuario.
   * Se verifica contando órdenes anteriores que NO estén canceladas.
   */
  const previousOrdersCount = await db.order.count({
    where: {
      customerId: input.userId,
      status: { not: 'CANCELLED' },
    },
  });

  const isFirstPurchase = previousOrdersCount === 0;

  /** Construir el contexto completo para el engine */
  const context: PromotionContext = {
    userId: input.userId,
    customerRole: input.customerRole,
    cartItems: input.cartItems,
    cartTotalInCents: input.cartTotalInCents,
    couponCode: input.couponCode,
    isFirstPurchase,
  };

  /** Instanciar el engine y evaluar */
  const engine = new PromotionEngine();
  const result = await engine.evaluate(context);

  return result;
};
