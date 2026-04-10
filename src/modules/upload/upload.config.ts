import { env } from "../../config/env";

export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET!;

/** Presets por contexto de upload */
export const UPLOAD_PRESETS = {
    products: {
        folder: "products",
        maxBytes: 10 * 1024 * 1024, // 10MB (Cloudinary comprime al recibir)
        allowedFormats: ["jpg", "png", "webp"],
        transformation: "w_1200,h_1200,c_limit,q_auto,f_auto",
    },
    payments: {
        folder: "payments",
        maxBytes: 10 * 1024 * 1024, // 10MB (Cloudinary comprime al recibir)
        allowedFormats: ["jpg", "png", "webp"],
        transformation: "w_1200,h_1200,c_limit,q_auto,f_auto",
    },
    promotions: {
        folder: "promotions",
        maxBytes: 10 * 1024 * 1024,
        allowedFormats: ["jpg", "png", "webp"],
        transformation: "w_1600,h_900,c_limit,q_auto,f_auto",
    },
    categories: {
        folder: "categories",
        maxBytes: 5 * 1024 * 1024,
        allowedFormats: ["jpg", "png", "webp"],
        transformation: "w_800,h_800,c_limit,q_auto,f_auto",
    },
} as const;

export type UploadContext = keyof typeof UPLOAD_PRESETS;
