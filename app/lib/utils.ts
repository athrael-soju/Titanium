// utils.ts
import { NextResponse } from 'next/server';
import { Collection } from 'mongodb';
import { Db } from 'mongodb';
import clientPromise from '@/app/lib/client/mongodb';

export const getDb = async (): Promise<Db> => {
  const client = await clientPromise;
  return client.db();
};

export const sendErrorResponse = (
  message: string,
  status: number
): NextResponse => {
  console.error(message);
  return NextResponse.json({ message }, { status });
};

export const getUserByEmail = async (
  usersCollection: Collection<IUser>,
  email: string
): Promise<IUser | null> => {
  return usersCollection.findOne({ email });
};
