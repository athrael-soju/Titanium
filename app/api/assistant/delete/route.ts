import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/client/mongodb';
import OpenAI from 'openai';

const openai = new OpenAI();

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
      const assistant = await openai.beta.assistants.retrieve(user.assistantId);
      const assistantFiles = await openai.beta.assistants.files.list(
        assistant.id
      );
      assistantFiles.data.forEach(async (file) => {
        await openai.beta.assistants.files.del(assistant.id, file.id);
        await openai.files.del(file.id);
      });
      let assistantDeletionResponse = await openai.beta.assistants.del(
        assistant.id
      );
      await usersCollection.updateOne(
        { email: userEmail },
        {
          $set: {
            assistantId: null,
            threadId: null,
            isAssistantEnabled: false,
          },
        }
      );

      return NextResponse.json(
        {
          message: 'Assistant deleted (With all associated files)',
          response: assistantDeletionResponse,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Assistant deletion unsuccessful:', error);
    return NextResponse.json(
      {
        message: 'Assistant deletion unsuccessful',
        error: error,
      },
      { status: 500 }
    );
  }
}
