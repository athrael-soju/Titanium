import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';

import OpenAI from 'openai';

// export const runtime = 'edge';

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db();

  try {
    const { userEmail, name, description, isActive } = await req.json();

    if (!userEmail || !name || !description || isActive === undefined) {
      return NextResponse.json('Missing required parameters', { status: 400 });
    }

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json('User not found', { status: 404 });
    }
    let assistant;
    let assistantId = user.assistantId;
    if (!assistantId) {
      // Create a new assistant
      assistant = await openai.beta.assistants.create({
        instructions: description,
        name: name,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
        model: process.env.OPENAI_API_MODEL as string,
      });
      assistantId = assistant.id;
      await usersCollection.updateOne(
        { email: userEmail },
        { $set: { assistantId } }
      );
    } else {
      assistant = await openai.beta.assistants.update(assistantId, {
        instructions: description,
        name: name,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
        model: process.env.OPENAI_API_MODEL as string,
        file_ids: [],
      });
    }
    return NextResponse.json('Assistant updated', { status: 200 });
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 500 });
  }
}
