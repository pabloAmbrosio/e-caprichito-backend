import crypto from "node:crypto";
import { 
    CLOUDINARY_API_SECRET, 
    UPLOAD_PRESETS, 
    UploadContext 
} from "../upload.config";


export interface UploadSignatureResult {
    signature: string;
    timestamp: number;
    folder: string;
    transformation: string;
}

export const generateSignature = (context: UploadContext) : UploadSignatureResult => {

    const preset = UPLOAD_PRESETS[context];
    const timestamp = Math.round(Date.now() / 1000);

    // Los params deben ir en orden alfabético para que la firma sea válida
    const paramsToSign =
        `folder=${preset.folder}` +
        `&timestamp=${timestamp}` +
        `&transformation=${preset.transformation}`;

    const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + CLOUDINARY_API_SECRET)
        .digest("hex");

    return { signature, timestamp, folder: preset.folder, transformation: preset.transformation };
}
