import clientPromise from '@/app/lib/client/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// export const runtime = 'edge';

const openai = new OpenAI();

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db();
  try {
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
    let assistant = null;
    if (!user) {
      return NextResponse.json('User not found', { status: 404 });
    }
    // If the user has an assistantId, retrieve the assistant from OpenAI
    if (user.assistantId) {
      assistant = await openai.beta.assistants.retrieve(user.assistantId);
    }
    // Return a JSON response
    return NextResponse.json({ assistant: assistant }, { status: 200 });
  } catch (error: any) {
    // Return an error response
    return NextResponse.json(error.message, { status: 500 });
  }
}
