/**
 * Rutas de backoffice para gestión de promociones.
 *
 * Todas las rutas requieren autenticación JWT y rol OWNER o ADMIN.
 * Se registran bajo el prefix /api/backoffice/promotions.
 *
 * Endpoints disponibles:
 * - POST   /promotions           → Crear promoción
 * - GET    /promotions           → Listar promociones (paginado)
 * - GET    /promotions/:id       → Obtener promoción por ID
 * - PATCH  /promotions/:id       → Actualizar promoción
 * - DELETE /promotions/:id       → Eliminar promoción (soft delete)
 * - POST   /promotions/:id/rules       → Agregar regla
 * - DELETE /promotions/:id/rules/:ruleId → Eliminar regla
 * - POST   /promotions/:id/actions       → Agregar acción
 * - DELETE /promotions/:id/actions/:actionId → Eliminar acción
 */
import type { FastifyInstance } from 'fastify';
import {
  CreatePromotionSchema,
  UpdatePromotionSchema,
  PromotionIdSchema,
  CreateRuleSchema,
  CreateActionSchema,
  ListPromotionsSchema,
} from '../schemas';
import {
  createPromotionHandler,
  updatePromotionHandler,
  deletePromotionHandler,
  getPromotionHandler,
  listPromotionsHandler,
  addRuleHandler,
  removeRuleHandler,
  addActionHandler,
  removeActionHandler,
} from '../handlers';
import { PROMOTION_URLS } from '../constants';

/**
 * Registra las rutas de backoffice para el modulo de promociones.
 * Todas las rutas estan protegidas con autenticacion + roles OWNER/ADMIN.
 *
 * #5 [BAJO]: Mejora futura - Permisos granulares por tienda.
 * Actualmente los permisos son globales (OWNER/ADMIN pueden gestionar todas
 * las promociones). En una arquitectura multi-tienda, se deberia agregar:
 * - Un campo `storeId` en el modelo Promotion
 * - Middleware que verifique que el usuario tiene acceso a la tienda especifica
 * - Roles como STORE_MANAGER que solo pueden gestionar promos de su tienda
 * Este cambio requiere modificaciones en el schema Prisma y en los middleware
 * de autorizacion, por lo que se planifica como mejora futura.
 */
export const backofficePromotionRoutes = async (fastify: FastifyInstance) => {
  /** Crear una nueva promoción */
  fastify.post(PROMOTION_URLS.BASE, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { body: CreatePromotionSchema },
    handler: createPromotionHandler,
  });

  /** Listar promociones con paginación y filtros */
  fastify.get(PROMOTION_URLS.BASE, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { querystring: ListPromotionsSchema },
    handler: listPromotionsHandler,
  });

  /** Obtener una promoción por ID con sus reglas y acciones */
  fastify.get(PROMOTION_URLS.BY_ID, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { params: PromotionIdSchema },
    handler: getPromotionHandler,
  });

  /** Actualizar una promoción existente (PATCH parcial) */
  fastify.patch(PROMOTION_URLS.BY_ID, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { params: PromotionIdSchema, body: UpdatePromotionSchema },
    handler: updatePromotionHandler,
  });

  /** Eliminar una promoción (soft delete) */
  fastify.delete(PROMOTION_URLS.BY_ID, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { params: PromotionIdSchema },
    handler: deletePromotionHandler,
  });

  /** Agregar una regla a una promoción */
  fastify.post(PROMOTION_URLS.RULES, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { params: PromotionIdSchema, body: CreateRuleSchema },
    handler: addRuleHandler,
  });

  /** Eliminar una regla de una promoción */
  fastify.delete(PROMOTION_URLS.RULE_BY_ID, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    handler: removeRuleHandler,
  });

  /** Agregar una acción de descuento a una promoción */
  fastify.post(PROMOTION_URLS.ACTIONS, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: { params: PromotionIdSchema, body: CreateActionSchema },
    handler: addActionHandler,
  });

  /** Eliminar una acción de una promoción */
  fastify.delete(PROMOTION_URLS.ACTION_BY_ID, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    handler: removeActionHandler,
  });
};
