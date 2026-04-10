/**
 * Rutas de la tienda (shop) para promociones.
 *
 * Estas rutas son para los clientes que compran.
 * Se registran bajo el prefix /api/promotions.
 *
 * Endpoints disponibles:
 * - GET  /promotions/banners      → Listar banners publicos activos (SIN auth)
 * - POST /promotions/apply-coupon → Previsualizar descuento de un cupón
 */
import type { FastifyInstance } from 'fastify';
import { ApplyCouponSchema } from '../schemas';
import { applyCouponHandler, listBannersHandler } from '../handlers';
import { PROMOTION_URLS } from '../constants';

/**
 * Registra las rutas de tienda para el módulo de promociones.
 */
export const shopPromotionRoutes = async (fastify: FastifyInstance) => {
  /** Listar banners publicos de promociones activas — SIN autenticación */
  fastify.get(PROMOTION_URLS.BANNERS, {
    handler: listBannersHandler,
  });

  /** Aplicar un cupón al carrito y ver preview de descuento */
  fastify.post(PROMOTION_URLS.APPLY_COUPON, {
    preHandler: [fastify.authenticate],
    schema: { body: ApplyCouponSchema },
    handler: applyCouponHandler,
  });
};
