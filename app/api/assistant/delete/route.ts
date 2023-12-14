import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/client/mongodb';
import OpenAI from 'openai';
import { Collection } from 'mongodb';

const openai = new OpenAI();

async function deleteUserAssistant(
  assistantId: string,
  userEmail: string,
  usersCollection: Collection<IUser>
) {
  const assistantFiles = await openai.beta.assistants.files.list(assistantId);
  for (const file of assistantFiles.data) {
    await openai.beta.assistants.files.del(assistantId, file.id);
    await openai.files.del(file.id);
  }
  await openai.beta.assistants.del(assistantId);
  await usersCollection.updateOne(
    { email: userEmail },
    { $set: { assistantId: null, threadId: null, isAssistantEnabled: false } }
  );
}

export async function POST(req: NextRequest) {
  const { userEmail } = await req.json();
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json('User not found', { status: 404 });
    }

    if (user.assistantId) {
      await deleteUserAssistant(user.assistantId, userEmail, usersCollection);
      return NextResponse.json(
        { message: 'Assistant deleted (With all associated files)' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'No assistant found for the user' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Assistant deletion unsuccessful:', error);
    return NextResponse.json(
      { message: 'Assistant deletion unsuccessful', error },
      { status: 500 }
    );
  }
}
