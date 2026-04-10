import * as v from 'valibot';

export const CreateInventorySchema = v.strictObject({
    productId: v.pipe(v.string(), v.uuid()),
    physicalStock: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const ProductIdParamSchema = v.strictObject({
    productId: v.pipe(v.string(), v.uuid())
});

export type CreateInventoryInput = v.InferInput<typeof CreateInventorySchema>;

export type ProductIdParamInput = v.InferInput<typeof ProductIdParamSchema>;

export const StockOperationSchema = v.strictObject({
    productId: v.pipe(v.string(), v.uuid()),
    quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99999))
});

export type StockOperationInput = v.InferInput<typeof StockOperationSchema>;
