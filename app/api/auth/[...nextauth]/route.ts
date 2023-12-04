import NextAuth from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_ID as string,
    clientSecret: process.env.GOOGLE_SECRET as string,
  }),
];

const options: NextAuthOptions = { providers };

const handler = NextAuth(options);
export { handler as GET, handler as POST };
