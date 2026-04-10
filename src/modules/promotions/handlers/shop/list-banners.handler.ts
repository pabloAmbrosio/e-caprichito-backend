/**
 * Handler para listar banners publicos de promociones activas.
 * Endpoint sin autenticación.
 */
import type { RouteHandler } from 'fastify';
import { listBannersService } from '../../services';
import { handlePromotionError } from '../../errors';

interface Handler extends RouteHandler {}

export const listBannersHandler: Handler = async (request, reply) => {
  try {
    const { msg, data } = await listBannersService();
    return reply.send({ success: true, msg, data });
  } catch (error) {
    return handlePromotionError(error, reply, request, 'listar banners');
  }
};
