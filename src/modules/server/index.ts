import fastify from 'fastify';

import { authPlugin } from '../../plugins/auth';
import { guardsPlugin } from '../../plugins/guards';
import { oauthPlugin } from '../../plugins/oauth';
import { rateLimitPlugin } from '../../plugins/rate-limit';
import { cookiePlugin } from '../../plugins/cookie';
import corsPlugin from '../../plugins/cors';
import cookieAuth from '../../plugins/cookie-auth';
import { socketIOPlugin } from '../../plugins/socket-io.plugin';
import { staticPlugin } from '../../plugins/static';

import { shopProductRoutes, backofficeProductRoutes } from '../product/routes';
import authRoute from '../auth/routes'
import { shopCartRoutes, backofficeCartRoutes } from '../cart/routes';
import { shopOrderRoutes, backofficeOrderRoutes } from '../order/routes';
import { backofficeInventoryRoutes } from '../inventory/routes'
import { backofficeUserRoutes } from '../user/routes';
import { backofficePromotionRoutes, shopPromotionRoutes } from '../promotions/routes';
import { shopPaymentRoutes, backofficePaymentRoutes } from '../payments/routes';
import { shopAddressRoutes, backofficeAddressRoutes } from '../address/routes';
import { shopShipmentRoutes, backofficeShipmentRoutes } from '../shipment/routes';
import { uploadRoutes } from '../upload';

import { customValibotCompiler, globalErrorHandler, registerHealthCheck } from './helpers';

export const buildServer = () => {

    const server = fastify({ logger: true });

    server.setValidatorCompiler(customValibotCompiler);
    server.setErrorHandler(globalErrorHandler);

    // --- PLUGINS (base: CORS, cookies, rate limit) ---
    [corsPlugin, cookiePlugin, cookieAuth, rateLimitPlugin]
        .forEach(plugin => server.register(plugin));

    server.after(); // base lista antes de registrar auth

    // --- PLUGINS (auth + extras) ---
    [authPlugin, guardsPlugin, oauthPlugin, socketIOPlugin, staticPlugin]
        .forEach(plugin => server.register(plugin));

    // --- HEALTH CHECK ---
    registerHealthCheck(server);

    // --- RUTAS SHOP (api/) ---
    const shopRoutes = [
        authRoute, shopProductRoutes, shopCartRoutes, shopOrderRoutes,
        shopPromotionRoutes, shopPaymentRoutes, shopAddressRoutes,
        shopShipmentRoutes, uploadRoutes,
    ];
    shopRoutes.forEach(route => server.register(route, { prefix: 'api/' }));

    // --- RUTAS BACKOFFICE (api/backoffice) ---
    const backofficeRoutes = [
        backofficeProductRoutes, backofficeCartRoutes, backofficeOrderRoutes,
        backofficeInventoryRoutes, backofficeUserRoutes, backofficePromotionRoutes,
        backofficePaymentRoutes, backofficeAddressRoutes, backofficeShipmentRoutes,
    ];
    backofficeRoutes.forEach(route => server.register(route, { prefix: 'api/backoffice' }));

    return server
}
