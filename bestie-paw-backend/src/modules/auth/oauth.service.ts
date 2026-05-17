import { prisma } from '../../utils/prisma';
import { hashValue } from '../../utils/hash';
import { refreshTokenExpiresAt, signAccessToken, signRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';

type OAuthProfile = {
  email: string;
  username: string;
  provider: 'google' | 'apple';
};

const storeRefreshToken = async (userId: string, token: string) => {
  const tokenHash = await hashValue(token);
  const expiresAt = refreshTokenExpiresAt();

  if (env.REFRESH_SINGLE_DEVICE) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  await prisma.refreshToken.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt
    }
  });
};

export const findOrCreateOAuthUser = async (profile: OAuthProfile) => {
  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        username: profile.username,
        passwordHash: '',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        termsVersion: env.TERMS_VERSION
      }
    });
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });

  await storeRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken, user };
};
