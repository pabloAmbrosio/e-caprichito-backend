// plugins/cookie-auth.ts
import type { FastifyInstance, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

/**
 * sameSite cambia segun el entorno.
 *
 * - Produccion: 'strict' — La cookie solo se envia en solicitudes del mismo sitio.
 *   Esto previene ataques CSRF ya que el navegador no adjuntara la cookie en
 *   solicitudes cross-site (por ejemplo, desde un enlace en un email o sitio externo).
 *   Requiere que el frontend y el backend compartan el mismo dominio raiz.
 *
 * - Desarrollo: 'lax' — La cookie se envia en navegaciones top-level (GET) desde
 *   otros sitios, lo cual facilita el flujo de desarrollo con OAuth callbacks
 *   y redirecciones entre puertos distintos en localhost.
 */
const sameSitePolicy = isProduction ? 'strict' as const : 'lax' as const;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSitePolicy,
  path: '/api/auth',
  maxAge: 60 * 60 * 24 * 7, // 7 dias en segundos
};

const cookieAuth = async (app: FastifyInstance): Promise<void> => {
  app.decorateReply('setRefreshToken', function (this: FastifyReply, uuid: string) {
    return this.setCookie('refresh_token', uuid, COOKIE_OPTIONS);
  });

  app.decorateReply('setTempAccessToken', function (this: FastifyReply, token: string) {
    return this.setCookie('temp_access_token', token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: sameSitePolicy,
      path: '/',
      maxAge: 60, // 60 segundos, suficiente para que el front lo guarde en localStorage
    })
  });

  app.decorateReply('clearRefreshToken', function (this: FastifyReply) {
    return this.clearCookie('refresh_token', { path: COOKIE_OPTIONS.path });
  });
};

export default fp(cookieAuth, {
  name: 'cookie-auth',
  dependencies: ['@fastify/cookie'],
});

declare module 'fastify' {
  interface FastifyReply {
    setRefreshToken(uuid: string): FastifyReply;
    clearRefreshToken(): FastifyReply;
    setTempAccessToken(token: string): FastifyReply;
  }
}