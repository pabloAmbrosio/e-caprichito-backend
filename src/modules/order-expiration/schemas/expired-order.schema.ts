import * as v from 'valibot';

/**
 * #3 [ALTO]: Schema Valibot para validar ExpiredOrderData antes de pasar a los handlers.
 * Garantiza que los datos de la BD tengan la estructura esperada y previene
 * propagacion de datos corruptos al pipeline de expiracion.
 */
export const ExpiredOrderDataSchema = v.strictObject({
  id: v.pipe(v.string(), v.uuid()),
  customerId: v.pipe(v.string(), v.uuid()),
  items: v.array(
    v.strictObject({
      productId: v.pipe(v.string(), v.uuid()),
      quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
    })
  ),
  expiresAt: v.date(),
});

export type ValidatedExpiredOrderData = v.InferOutput<typeof ExpiredOrderDataSchema>;
