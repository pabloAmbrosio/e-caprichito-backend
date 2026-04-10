export const INVENTORY_URL = "/inventory";

export const PRODUCT_INCLUDE = {
    product: {
        select: {
            id: true,
            title: true
        }
    }
} as const;

export const withAvailableStock = <T extends { physicalStock: number; reservedStock: number }>(
    inventory: T
) => ({
    ...inventory,
    availableStock: inventory.physicalStock - inventory.reservedStock
});
