import type { Prisma } from '../../../../../lib/prisma';
import type { abstractProductSelect, productVariantSelect } from '../../../product.select';

export type AbstractProductResult = Prisma.AbstractProductGetPayload<{
  select: typeof abstractProductSelect;
}>;

export type ProductVariantResult = Prisma.ProductGetPayload<{
  select: typeof productVariantSelect;
}>;

export interface InitializeProductResult {
  abstractProduct: AbstractProductResult;
  variants: ProductVariantResult[];
}
