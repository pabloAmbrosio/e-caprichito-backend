import type { DeliveryType } from "../../../lib/prisma";
import { haversine } from "./haversine";
import {
    STORE_LAT, STORE_LNG,
    HOME_DELIVERY_MAX_KM,
    SHIPPING_ZONES,
} from "../shipment.config";

export interface DeliveryFeeResult {
    deliveryType: DeliveryType;
    fee: number;
    distanceKm: number;
    available: boolean;
}

export function calculateDeliveryFee(lat: number, lng: number): DeliveryFeeResult {
    const distanceKm = haversine(STORE_LAT, STORE_LNG, lat, lng);

    if (distanceKm <= HOME_DELIVERY_MAX_KM) {
        return { deliveryType: "HOME_DELIVERY", fee: 0, distanceKm, available: true };
    }

    for (const zone of SHIPPING_ZONES) {
        if (distanceKm <= zone.maxKm) {
            return { deliveryType: "SHIPPING", fee: zone.feeCents, distanceKm, available: true };
        }
    }

    return { deliveryType: "SHIPPING", fee: 0, distanceKm, available: false };
}
