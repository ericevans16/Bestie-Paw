import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { sendError } from '../utils/response';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'Missing access token', 401);
    }

    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null
      }
    });

    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'User not found', 401);
    }

    req.user = { userId: user.id, email: user.email };
    return next();
  } catch (err) {
    return next(err);
  }
};
