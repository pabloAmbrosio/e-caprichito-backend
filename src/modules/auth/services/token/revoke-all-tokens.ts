import { redisClient } from '../../../../lib/redis';

export const revokeAllTokens = async (userId: string): Promise<void> => {
  const userSetKey = `rt:user:${userId}`;
  const tokens = await redisClient.smembers(userSetKey);

  if (tokens.length > 0) {
    const pipeline = redisClient.pipeline();
    tokens.forEach(t => pipeline.del(`rt:${t}`));
    await pipeline.exec();
  }

  await redisClient.del(userSetKey);
};
