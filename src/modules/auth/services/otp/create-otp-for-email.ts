import { redisClient } from "../../../../lib/redis";
import { OTPCooldownError, OTPDailyLimitError } from "../../errors";
import { OTP_EXPIRATION_SECONDS, OTP_COOLDOWN_SECONDS, OTP_DAILY_MAX } from "../../constants";
import { generateOTP } from "./generate-otp";

// Uses email:-prefixed Redis keys to avoid collision with phone OTP keys.
// Same otp:code:{userId} key as phone OTP -- only one active OTP per user at a time.
export const createOTPForEmail = async (userId: string, email: string): Promise<string> => {
  const cooldownKey = `otp:cooldown:email:${email}`;
  const isInCooldown = await redisClient.exists(cooldownKey);

  if (isInCooldown) {
    throw new OTPCooldownError(OTP_COOLDOWN_SECONDS);
  }

  const dailyKey = `otp:daily:email:${email}`;
  const dailyCount = await redisClient.get(dailyKey);

  if (dailyCount && parseInt(dailyCount) >= OTP_DAILY_MAX) {
    throw new OTPDailyLimitError(OTP_DAILY_MAX);
  }

  const code = generateOTP();

  const codeKey = `otp:code:${userId}`;
  await redisClient.set(codeKey, code, "EX", OTP_EXPIRATION_SECONDS);
  await redisClient.set(cooldownKey, "1", "EX", OTP_COOLDOWN_SECONDS);

  const newCount = await redisClient.incr(dailyKey);

  if (newCount === 1) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const secondsUntilMidnight = Math.ceil((endOfDay.getTime() - now.getTime()) / 1000);
    await redisClient.expire(dailyKey, secondsUntilMidnight);
  }

  return code;
};
