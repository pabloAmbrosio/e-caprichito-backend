import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../../../lib/redis';
import { db } from '../../../../lib/prisma';
import { userSelect } from '../../user.selects';
import { REFRESH_TOKEN_SECONDS } from '../../constants';
import { calculateExpirationDate } from './get-token-expiration';

export const revokeAllTokensByUserIdAndRenewToken = async (userId: string) => {
  const userSetKey = `rt:user:${userId}`;
  const tokens = await redisClient.smembers(userSetKey);

  if (tokens.length > 0) {
    const pipeline = redisClient.pipeline();
    tokens.forEach(t => pipeline.del(`rt:${t}`));
    await pipeline.exec();
  }

  await redisClient.del(userSetKey);

  const newToken = uuidv4();
  const expiresAt = calculateExpirationDate(REFRESH_TOKEN_SECONDS);

  await redisClient.set(
    `rt:${newToken}`,
    JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }),
    'EX',
    REFRESH_TOKEN_SECONDS
  );

  await redisClient.sadd(userSetKey, newToken);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: userSelect
  });

  return { token: newToken, expiresAt, user };
};
