import NextAuth from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID ?? '',
    clientSecret: process.env.GITHUB_SECRET ?? '',
  }),
];

const options: NextAuthOptions = { providers };

const handler = NextAuth(options);
export { handler as GET, handler as POST };
