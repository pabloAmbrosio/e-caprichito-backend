// Shared
export { generateSlug, handlePrismaError } from './shared';

// Product
export { assertProductExists, findProductOrFail, buildCategoryBreadcrumb, mapToProductDetail } from './product';

// Like
export { checkUserLike, createProductLike, removeProductLike, findLikedProducts, mapToLikedProduct } from './like';

// Category
export { findCategoryOrFail, fetchAllCategories, buildCategoryTree, createCategoryRecord, updateCategoryRecord, deactivateCategory } from './category';

// Autocomplete
export { sanitizeAutocomplete, buildAutocompleteSql } from './autocomplete';
