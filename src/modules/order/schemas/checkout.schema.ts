import * as v from "valibot";
import { PAYMENT_METHODS } from "../../payments/constants";

export const CheckoutSchema = v.strictObject({
    addressId: v.optional(v.pipe(v.string(), v.uuid())),
    paymentMethod: v.optional(
        v.picklist([...PAYMENT_METHODS], "Método de pago no válido")
    ),
});

export type CheckoutBody = v.InferInput<typeof CheckoutSchema>;
