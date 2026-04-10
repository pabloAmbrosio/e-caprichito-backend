import 'dotenv/config';

import { env } from "./config/env";
import { buildServer } from "./modules/server";
import { initOrderExpiration } from "./modules/order-expiration/order-expiration.module";
import { initPaymentExpiration } from "./modules/payment-expiration/payment-expiration.module"; // #13
import { db } from './lib/prisma';

const app = buildServer();

const start = async () => {
  try {
    // Verificar conexion a base de datos al inicio 
    await db.$queryRawUnsafe('SELECT 1');
    console.log('[DB] Conexion a base de datos verificada correctamente');

    await app.ready();
    initOrderExpiration(app.io);
    initPaymentExpiration(app.io); // #13: Iniciar expiración de pagos PENDING sin comprobante

    const port = env.PORT;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Docs available at http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();