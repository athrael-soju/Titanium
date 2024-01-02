import { Collection, Db } from 'mongodb';
import clientPromise from '@/app/lib/client/mongodb';
import { NextRequest, NextResponse } from 'next/server';

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

export const sendErrorResponse = (
  message: string,
  status: number
): NextResponse => {
  console.error(message);
  return NextResponse.json({ message }, { status });
};

export async function getDatabaseAndUser(req: NextRequest) {
  const db = await getDb();
  const { file, userEmail } = (await req.json()) as {
    file: IFile;
    userEmail: string;
  };

  const usersCollection = db.collection<IUser>('users');
  const user = await getUserByEmail(usersCollection, userEmail);

  if (!user) {
    throw new Error('User not found');
  }

  return { db, user, file };
}
