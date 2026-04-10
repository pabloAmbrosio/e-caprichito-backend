import { redisClient } from "../../../../lib/redis";

export const verifyOTP = async (userId: string, code: string): Promise<boolean> => {
  const codeKey = `otp:code:${userId}`;
  const storedCode = await redisClient.get(codeKey);

  if (!storedCode || storedCode !== code) return false;

  // Delete after successful verification to prevent reuse
  await redisClient.del(codeKey);

  return true;
};
