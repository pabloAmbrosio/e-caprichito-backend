import { redisClient } from "../../../../lib/redis";

interface DeleteOTPParams {
    userId: string;
    phone?: string | null;
    email?: string | null;
}

export const deleteOTP = async ({ userId, phone, email }: DeleteOTPParams): Promise<void> => {
    const keysToDelete: string[] = [`otp:code:${userId}`];

    if (phone) {
        keysToDelete.push(`otp:cooldown:${phone}`);
        keysToDelete.push(`otp:daily:${phone}`);
    }

    if (email) {
        keysToDelete.push(`otp:cooldown:email:${email}`);
        keysToDelete.push(`otp:daily:email:${email}`);
    }

    await redisClient.del(keysToDelete);
};
