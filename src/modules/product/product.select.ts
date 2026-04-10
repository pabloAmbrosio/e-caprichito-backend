import { Prisma } from '../../lib/prisma';

export const abstractProductSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  categoryId: true,
  tags: true,
  isFeatured: true,
  seoMetadata: true,
  status: true,
  publishedAt: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AbstractProductSelect;

export const productVariantSelect = {
  id: true,
  abstractProductId: true,
  title: true,
  sku: true,
  priceInCents: true,
  compareAtPriceInCents: true,
  details: true,
  images: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const productVariantWithStockSelect = {
  id: true,
  sku: true,
  title: true,
  priceInCents: true,
  compareAtPriceInCents: true,
  details: true,
  images: true,
  inventory: {
    select: { physicalStock: true, reservedStock: true },
  },
} satisfies Prisma.ProductSelect;

export const productExistsSelect = {
  id: true,
} satisfies Prisma.AbstractProductSelect;

export const productLikeResultSelect = {
  id: true,
  abstractProductId: true,
  createdAt: true,
} satisfies Prisma.ProductLikeSelect;

export const productDetailSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  categoryId: true,
  tags: true,
  isFeatured: true,
  seoMetadata: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  products: {
    where: { deletedAt: null, status: 'PUBLISHED' },
    select: productVariantWithStockSelect,
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.AbstractProductSelect;

export const backofficeVariantSelect = {
  ...productVariantSelect,
  inventory: {
    select: { physicalStock: true, reservedStock: true },
  },
} satisfies Prisma.ProductSelect;

export const backofficeProductDetailSelect = {
  ...abstractProductSelect,
  _count: { select: { productLikes: true } },
  products: {
    where: { deletedAt: null },
    select: backofficeVariantSelect,
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.AbstractProductSelect;

export const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  emoticon: true,
  parentId: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

export const categoryWithChildrenSelect = {
  ...categorySelect,
  children: {
    select: categorySelect,
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.CategorySelect;

export const categoryWithAllChildrenSelect = {
  ...categorySelect,
  children: {
    select: categorySelect,
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.CategorySelect;

export const likedProductSelect = {
  id: true,
  createdAt: true,
  abstractProduct: {
    select: productDetailSelect,
  },
} satisfies Prisma.ProductLikeSelect;
