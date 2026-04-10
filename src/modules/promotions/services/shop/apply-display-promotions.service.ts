/**
 * Servicio puente para el Display Promotion Engine.
 *
 * Recibe productos del search engine + contexto de usuario (opcional),
 * pre-computa isFirstPurchase si hay usuario, y delega al DisplayPromotionEngine.
 *
 * Este servicio es el punto de entrada para cualquier parte del sistema
 * que necesite saber qué promociones mostrar a nivel de producto.
 */
import { db } from '../../../../lib/prisma';
import { DisplayPromotionEngine } from '../../engine/display-promotion-engine';
import type {
  ProductForDisplayEngine,
  DisplayUserContext,
  DisplayEngineResult,
} from '../../types/display-engine-types';

/**
 * Datos necesarios para evaluar promociones mostrables.
 */
interface ApplyDisplayPromotionsInput {
  /** Productos a evaluar (resultado del search engine) */
  readonly products: readonly ProductForDisplayEngine[];
  /** ID del usuario (null si no autenticado) */
  readonly userId: string | null;
  /** Rol VIP del usuario (null si no autenticado) */
  readonly customerRole: string | null;
}

/**
 * Evalúa qué promociones son mostrables para cada producto.
 *
 * Flujo:
 * 1. Si hay usuario, pre-computa isFirstPurchase
 * 2. Construye DisplayUserContext
 * 3. Instancia DisplayPromotionEngine y ejecuta evaluate()
 * 4. Retorna el mapa de productId → promotions
 */
export const applyDisplayPromotionsService = async (
  input: ApplyDisplayPromotionsInput
): Promise<DisplayEngineResult> => {
  let isFirstPurchase: boolean | null = null;

  // Pre-computar isFirstPurchase solo si hay usuario autenticado
  if (input.userId) {
    const previousOrdersCount = await db.order.count({
      where: {
        customerId: input.userId,
        status: { not: 'CANCELLED' },
      },
    });
    isFirstPurchase = previousOrdersCount === 0;
  }

  const userContext: DisplayUserContext = {
    userId: input.userId,
    customerRole: input.customerRole,
    isFirstPurchase,
  };

  const engine = new DisplayPromotionEngine();
  return engine.evaluate(input.products, userContext);
};
