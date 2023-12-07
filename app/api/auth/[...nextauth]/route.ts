import NextAuth, { User } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '../../../lib/client/mongodb';
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  starWars,
} from 'unique-names-generator';
import CredentialsProvider from 'next-auth/providers/credentials';
import { randomUUID } from 'crypto';

const createAnonymousUser = (): User => {
  // generate a random name and email for this anonymous user
  const customConfig: Config = {
    dictionaries: [adjectives, colors, starWars],
    separator: '-',
    length: 3,
    style: 'capital',
  };
  const unique_handle: string = uniqueNamesGenerator(customConfig).replaceAll(
    ' ',
    ''
  );
  const unique_realname: string = unique_handle.split('-').slice(1).join(' ');
  const unique_uuid: string = randomUUID();
  return {
    id: unique_uuid,
    email: `${unique_handle.toLowerCase()}@guest.com`,
    name: unique_realname,
    image: '',
  };
};

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_ID as string,
    clientSecret: process.env.GOOGLE_SECRET as string,
  }),
  CredentialsProvider({
    name: 'a Guest Account',
    credentials: {},
    async authorize(credentials, req) {
      console.log('credentials', credentials);
      return createAnonymousUser();
    },
  }),
];

const options: NextAuthOptions = {
  providers,
  adapter: MongoDBAdapter(clientPromise),
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
