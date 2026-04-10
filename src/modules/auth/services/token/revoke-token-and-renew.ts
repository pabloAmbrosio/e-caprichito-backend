import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../../../lib/redis';
import { db } from '../../../../lib/prisma';
import { userSelect } from '../../user.selects';
import { REFRESH_TOKEN_SECONDS } from '../../constants';
import { calculateExpirationDate } from './get-token-expiration';

export const revokeTokenAndRenew = async (userId: string, currentToken: string) => {
  await redisClient.del(`rt:${currentToken}`);
  await redisClient.srem(`rt:user:${userId}`, currentToken);

  const newToken = uuidv4();
  const expiresAt = calculateExpirationDate(REFRESH_TOKEN_SECONDS);

  await redisClient.set(
    `rt:${newToken}`,
    JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }),
    'EX',
    REFRESH_TOKEN_SECONDS
  );

  await redisClient.sadd(`rt:user:${userId}`, newToken);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: userSelect
  });

  return { token: newToken, expiresAt, user };
};
