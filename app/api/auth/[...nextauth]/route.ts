import NextAuth, {
  Account,
  Profile,
  SessionStrategy,
  Session,
  User,
} from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';
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
import Debug from 'debug';
const debug = Debug('nextjs:api:auth');

interface CustomUser extends User {
  provider?: string;
}

interface CustomSession extends Session {
  token_provider?: string;
}

const createAnonymousUser = (): User => {
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
    name: unique_realname,
    email: `${unique_handle.toLowerCase()}@titanium-guest.com`,
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
      const user = createAnonymousUser();

      // Get the MongoDB client and database
      const client = await clientPromise;
      const db = client.db();

      // Check if user already exists
      const existingUser = await db
        .collection('users')
        .findOne({ email: user.email });
      if (!existingUser) {
        // Save the new user if not exists
        await db.collection('users').insertOne(user);
      }

      return user;
    },
  }),
];

const options: NextAuthOptions = {
  providers,
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account: Account | null;
      profile?: Profile;
    }): Promise<JWT> {
      if (account?.expires_at && account?.type === 'oauth') {
        token.access_token = account.access_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;
        token.refresh_token_expires_in = account.refresh_token_expires_in;
        token.provider = 'github';
      }
      if (!token.provider) token.provider = 'Titanium';
      return token;
    },
    async session({
      session,
      token,
      user,
    }: {
      session: CustomSession;
      token: JWT;
      user: AdapterUser;
    }): Promise<Session> {
      if (token.provider) {
        session.token_provider = token.provider as string;
      }
      return session;
    },
  },
  events: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: CustomUser;
      account: Account | null;
      profile?: Profile;
    }): Promise<void> {
      debug(
        `signIn of ${user.name} from ${user?.provider ?? account?.provider}`
      );
    },
    async signOut({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<void> {
      debug(`signOut of ${token.name} from ${token.provider}`);
    },
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
