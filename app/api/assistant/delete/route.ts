import { NextRequest, NextResponse } from 'next/server';
import {getDb, sendErrorResponse, getUserByEmail } from '@/app/lib/utils/db';
import OpenAI from 'openai';
import { Collection } from 'mongodb';

const openai = new OpenAI();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userEmail } = await req.json();

  try {
    const db = await getDb();
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (user.assistantId) {
      await deleteUserAssistant(user.assistantId, userEmail, usersCollection);
      return NextResponse.json(
        { message: 'Assistant deleted (With all associated files)' },
        { status: 200 }
      );
    }

    return sendErrorResponse('No assistant found for the user', 404);
  } catch (error: any) {
    return sendErrorResponse('Assistant deletion unsuccessful', 500);
  }
}

// Helper function
async function deleteUserAssistant(
  assistantId: string,
  userEmail: string,
  usersCollection: Collection<IUser>
): Promise<void> {
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
