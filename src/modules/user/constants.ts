// adminRole = permisos (OWNER>ADMIN>MANAGER>SELLER>CUSTOMER). customerRole = loyalty tier (null si no es CUSTOMER).

export const USER_URL = "/users";

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
} as const;

export const SORTING = {
    VALID_SORT_FIELDS: ['createdAt', 'username', 'email'] as const,
    VALID_SORT_ORDERS: ['asc', 'desc'] as const,
    DEFAULT_SORT_FIELD: 'createdAt' as const,
    DEFAULT_SORT_ORDER: 'desc' as const,
} as const;
