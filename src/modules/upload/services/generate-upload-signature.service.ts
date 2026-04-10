import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY } from "../upload.config";
import type { UploadContext } from "../upload.config";
import { generateSignature } from "../helpers";

export function generateUploadSignatureService(context: UploadContext) {
    
    const { signature, timestamp, folder, transformation } = generateSignature(context);

    return {
        msg: "Firma de upload generada",
        data: {
            signature,
            timestamp,
            cloudName: CLOUDINARY_CLOUD_NAME,
            apiKey: CLOUDINARY_API_KEY,
            folder,
            transformation,
        },
    };
}
