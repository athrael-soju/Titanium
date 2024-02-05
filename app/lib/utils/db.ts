import { Collection, Db } from 'mongodb';
import clientPromise from '@/app/lib/client/mongodb';

export const getDb = async (): Promise<Db> => {
  const client = await clientPromise;
  return client.db();
};

export const getUserByEmail = async (
  usersCollection: Collection<IUser>,
  email: string
): Promise<IUser | null> => {
  return usersCollection.findOne({ email });
};

export async function getDatabaseAndUser(
  db: Db,
  userEmail: string
): Promise<{ db: Db; user: IUser }> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  const usersCollection = db.collection<IUser>('users');
  const user = await getUserByEmail(usersCollection, userEmail);

  if (!user) {
    throw new Error('User not found');
  }

  return { db, user };
}
