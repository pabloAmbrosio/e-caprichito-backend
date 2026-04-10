import type { ProductImage } from '../../types';

export type ImageJson = ProductImage;

export interface VariantDetailJson {
  [key: string]: string | number | boolean;
}
