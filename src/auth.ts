import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { z } from 'zod';
import { authAPI } from '@/services/api/auth-api';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Reads a JWT's `exp` claim without needing a full JWT library - just enough to know
// when the backend will start rejecting this access token.
function decodeJwtExpiryMs(jwt: string): number {
  const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
  return payload.exp * 1000;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshed = await authAPI.refreshToken(token.refreshToken as string);
    return {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpires: decodeJwtExpiryMs(refreshed.accessToken),
      error: undefined,
    };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    // Refresh token itself is expired/invalid (>7 days since login) - nothing left to
    // silently recover. Flag it so the client can force a sign-out instead of every
    // subsequent backend call crashing with an unhandled 401.
    return { ...token, error: 'RefreshTokenExpired' };
  }
}

export const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const { user, accessToken, refreshToken } = await authAPI.login(email, password);

          return {
            id: user.id,
            email: user.email,
            name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email,
            role: user.role,
            image: user.profile?.avatarUrl,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/account/login',
    error: '/account/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = decodeJwtExpiryMs(user.accessToken);
        return token;
      }

      // Small buffer so a request doesn't race a token that's about to expire.
      if (Date.now() < (token.accessTokenExpires as number) - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        session.user.id = token.id as string;
      }
      (session as any).accessToken = token.accessToken;
      (session as any).error = token.error;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = 'token' in message ? (message.token as JWT | null) : null;
      if (token?.accessToken) {
        try {
          await authAPI.logout(token.accessToken as string);
        } catch (error) {
          console.error('Backend logout failed:', error);
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);