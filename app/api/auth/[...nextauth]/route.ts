import NextAuth, { User } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  starWars,
  animals,
} from 'unique-names-generator';
import CredentialsProvider from 'next-auth/providers/credentials';
import { randomUUID } from 'crypto';

const createAnonymousUser = (): User => {
  // generate a random name and email for this anonymous user
  const customConfig: Config = {
    dictionaries: [adjectives, colors, animals, starWars],
    separator: '-',
    length: 3,
    style: 'capital',
  };
  // handle is simple-red-aardvark
  const unique_handle: string = uniqueNamesGenerator(customConfig).replaceAll(
    ' ',
    ''
  );
  // real name is Red Aardvark
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
      return createAnonymousUser();
    },
  }),
];

const options: NextAuthOptions = { providers };

const handler = NextAuth(options);
export { handler as GET, handler as POST };
