/**
 * Schema de validación para aplicar un cupón al carrito.
 * Valida el body de la petición POST /promotions/apply-coupon.
 */
import * as v from 'valibot';

/** Schema de validación para el body de aplicar cupón */
export const ApplyCouponSchema = v.object({
  /** Código de cupón ingresado por el cliente */
  couponCode: v.pipe(
    v.string('El código de cupón debe ser texto'),
    v.nonEmpty('El código de cupón es requerido'),
    v.trim(),
    v.minLength(3, 'El código de cupón debe tener al menos 3 caracteres'),
    v.maxLength(50, 'El código de cupón no puede tener más de 50 caracteres')
  ),
});

/** Tipo inferido del schema de aplicar cupón */
export type ApplyCouponInput = v.InferInput<typeof ApplyCouponSchema>;
