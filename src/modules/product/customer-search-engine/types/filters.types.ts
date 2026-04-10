import type { SortField } from './sort.types';

export interface WhereFilters {
  categoryIds?: string[];
  title?: string;
  tags?: string[];
  isFeatured?: boolean;
  minPriceInCents?: number;
  maxPriceInCents?: number;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface ListProductsFilters extends WhereFilters {
  // Paginación y ordenamiento
  sort?: SortField[];
  limit?: number;
  offset?: number;
  randomSeed?: number;

  // Aggregates opcionales
  includeSales?: boolean;
  includeLikes?: boolean;

  // Contexto del usuario
  userId?: string;
}
