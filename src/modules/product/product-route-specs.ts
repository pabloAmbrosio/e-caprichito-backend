import { AutocompleteInput } from "./schemas/autocomplete.schema";
import { ListProductsInput } from "./schemas/list-products.schema";
import { ProductIdInput, ProductIdOrSlugInput, VariantParamsInput, CategoryIdInput } from "./schemas/product-params.schema";
import { GetLikedProductsInput } from "./schemas/get-liked-products.schema";
import { InitializeProductInput } from "./schemas/initialize-product.schema";
import { UpdateProductInput } from "./schemas/update-product.schema";
import { ChangeProductStatusInput } from "./schemas/change-status.schema";
import { AddVariantsInput } from "./schemas/add-variants.schema";
import { UpdateVariantInput } from "./schemas/update-variant.schema";
import { CreateCategoryInput } from "./schemas/create-category.schema";
import { UpdateCategoryInput } from "./schemas/update-category.schema";

export type AutocompleteRouteSpec      = { Querystring: AutocompleteInput };
export type ListProductsRouteSpec      = { Querystring: ListProductsInput };
export type GetProductDetailRouteSpec  = { Params: ProductIdOrSlugInput };
export type AddProductLikeRouteSpec    = { Params: ProductIdInput };
export type RemoveProductLikeRouteSpec = { Params: ProductIdInput };
export type GetLikedProductsRouteSpec  = { Querystring: GetLikedProductsInput };
export type GetLikedProductIdsRouteSpec = {};

export type InitializeProductRouteSpec    = { Body: InitializeProductInput };
export type GetProductBackofficeRouteSpec = { Params: ProductIdInput };
export type UpdateProductRouteSpec        = { Params: ProductIdInput;     Body: UpdateProductInput };
export type DeleteProductRouteSpec        = { Params: ProductIdInput };
export type DeleteVariantRouteSpec        = { Params: VariantParamsInput };
export type ChangeProductStatusRouteSpec  = { Params: ProductIdInput;     Body: ChangeProductStatusInput };
export type ChangeVariantStatusRouteSpec  = { Params: VariantParamsInput; Body: ChangeProductStatusInput };
export type UpdateVariantRouteSpec         = { Params: VariantParamsInput; Body: UpdateVariantInput };
export type AddVariantsRouteSpec          = { Params: ProductIdInput;     Body: AddVariantsInput };

export type CreateCategoryRouteSpec  = { Body: CreateCategoryInput };
export type GetCategoryRouteSpec     = { Params: CategoryIdInput };
export type UpdateCategoryRouteSpec  = { Params: CategoryIdInput; Body: UpdateCategoryInput };
export type DeleteCategoryRouteSpec      = { Params: CategoryIdInput };
export type ReactivateCategoryRouteSpec  = { Params: CategoryIdInput };
