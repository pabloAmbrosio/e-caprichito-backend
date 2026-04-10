import { redisClient } from "../../../lib/redis";

interface OTPStatusResult {
    active: boolean;
    remainingSeconds: number;
    expiresAt: string | null;
}

export const getOTPStatus = async (userId: string): Promise<OTPStatusResult> => {
    const codeKey = `otp:code:${userId}`;
    const ttl = await redisClient.ttl(codeKey);

    if (ttl <= 0) {
        return { active: false, remainingSeconds: 0, expiresAt: null };
    }

    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    return { active: true, remainingSeconds: ttl, expiresAt };
};
