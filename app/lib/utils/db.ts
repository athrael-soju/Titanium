import { NextResponse } from 'next/server';
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

export const sendErrorResponse = (
  message: string,
  status: number
): NextResponse => {
  console.error(message);
  return NextResponse.json({ message }, { status });
};

export const sendInformationResponse = (
  message: string,
  status: number
): NextResponse => {
  console.log(message);
  return NextResponse.json({ message }, { status });
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

export function handleErrorResponse(error: Error): NextResponse {
  console.error('Error:', error.message);
  const status =
    error.message === 'User not found' ||
    error.message === 'User email is required'
      ? 404
      : 500;
  return sendErrorResponse(error.message, status);
}
