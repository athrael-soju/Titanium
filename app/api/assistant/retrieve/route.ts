import clientPromise from '@/app/lib/client/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    // Retrieve the userEmail from the request headers
    const userEmail = req.headers.get('userEmail');
    if (!userEmail) {
      return NextResponse.json('userEmail header is required', {
        status: 400,
      });
    }
    // Retrieve the user from the database
    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    let assistant, thread;
    if (!user) {
      return NextResponse.json('User not found', { status: 404 });
    }
    // If the user has an assistantId, retrieve the assistant from OpenAI
    if (user.assistantId) {
      assistant = await openai.beta.assistants.retrieve(user.assistantId);
      thread = await openai.beta.threads.retrieve(user.threadId as string);
    }
    // Return a success response
    return NextResponse.json(
      {
        message: 'Assistant updated',
        assistant: assistant,
        threadId: thread?.id,
        isAssistantEnabled: user.isAssistantEnabled,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Return an error response
    return NextResponse.json(error.message, { status: 500 });
  }
}
