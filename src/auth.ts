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
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        session.user.id = token.id as string;
      }
      (session as any).accessToken = token.accessToken;
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