import * as v from 'valibot';

export const VerifyPhoneSchema = v.strictObject({
  userId: v.pipe(v.string(), v.uuid('userId debe ser UUID válido')),
  code: v.pipe(
    v.string('El código debe ser texto'),
    v.length(6, 'El código debe tener 6 dígitos'),
    v.regex(/^\d{6}$/, 'El código solo debe contener números')
  )
});

export type VerifyPhoneInput = v.InferInput<typeof VerifyPhoneSchema>;
