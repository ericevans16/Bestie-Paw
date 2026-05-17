import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  emailVerified: user.emailVerified
});

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null }
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return sanitizeUser(user);
};

export const updateCurrentUser = async (
  userId: string,
  data: { username?: string; phone?: string }
) => {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username,
        deletedAt: null,
        NOT: { id: userId }
      }
    });

    if (existing) {
      throw new AppError('CONFLICT', 'Username already in use', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  return sanitizeUser(user);
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl }
  });

  return sanitizeUser(user);
};

export const softDeleteUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });
};
