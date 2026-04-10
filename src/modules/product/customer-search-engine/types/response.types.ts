import type { ImageJson, VariantDetailJson } from './json.types';

interface VarianteRow {
  id: string;
  sku: string;
  title: string;
  priceInCents: number;
  images: ImageJson[] | null;
  details: VariantDetailJson;
  inStock: boolean;
}

interface CategoriaRow {
  id: string;
  name: string;
  slug: string;
}

export interface AbstractProductRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  // Breadcrumb ordered root-to-leaf: [grandparent, parent, category]
  categorias: CategoriaRow[];
  tags: string[];
  status: string;
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  variantes: VarianteRow[];
  inStock: boolean;
  // 0 unless includeSales or sort by sales is active
  totalSales: number;
  // 0 unless includeLikes or sort by likes is active
  totalLikes: number;
  // true only if userId was provided and user liked this product
  isLiked: boolean;
}

export interface PaginatedProducts {
  items: AbstractProductRow[];
  total: number;
}
