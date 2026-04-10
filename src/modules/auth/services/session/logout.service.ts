import { getRefreshToken } from '../token';
import { revokeAllTokens } from '../token';

export const logoutUser = async (refreshToken: string) => {
  const tokenData = await getRefreshToken(refreshToken);
  if (tokenData) {
    await revokeAllTokens(tokenData.user.id);
  }
};
