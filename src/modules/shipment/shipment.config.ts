// Default: Sabancuy
export const STORE_LAT = Number(process.env.STORE_LAT) || 18.972943;
export const STORE_LNG = Number(process.env.STORE_LNG) || -91.178980;

// Dentro de este radio: HOME_DELIVERY gratis (km)
export const HOME_DELIVERY_MAX_KM = 60;

export const SHIPPING_ZONES = [
    { maxKm: 120, feeCents: 10000 },
    { maxKm: 180, feeCents: 20000 },
];
