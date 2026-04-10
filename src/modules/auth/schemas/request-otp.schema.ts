import * as v from 'valibot';

export const RequestOTPSchema = v.strictObject({
  phone: v.pipe(
    v.string('El teléfono debe ser texto'),
    v.regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164: +1234567890')
  )
});

export type RequestOTPInput = v.InferInput<typeof RequestOTPSchema>;
