import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

/**
 * 内存缓存：单实例部署时有效，TTL 60 秒。
 * 多实例（负载均衡）部署时请替换为 Redis：
 *   await redisClient.setEx('public_stats', 60, JSON.stringify(data));
 *   const cached = await redisClient.get('public_stats');
 */
let cache: { data: { registeredUsers: number; petProfiles: number }; expiresAt: number } | null = null;

export const getPublicStats = async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return res.json({ success: true, data: cache.data });
  }

  const [userCount, petCount] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.pet.count()
  ]);

  cache = {
    data: {
      registeredUsers: userCount,
      petProfiles: petCount
    },
    expiresAt: now + 60_000
  };

  return res.json({ success: true, data: cache.data });
};
