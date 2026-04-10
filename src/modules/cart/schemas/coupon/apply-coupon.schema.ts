import * as v from 'valibot';

export const ApplyCouponToCartSchema = v.strictObject({
  couponCode: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export type ApplyCouponToCartInput = v.InferInput<typeof ApplyCouponToCartSchema>;
