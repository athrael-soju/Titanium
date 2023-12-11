import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';

import OpenAI from 'openai';

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
    let assistant, thread;
    if (!user.assistantId) {
      assistant = await openai.beta.assistants.create({
        instructions: description,
        name: name,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
        model: process.env.OPENAI_API_MODEL as string,
      });
      thread = await openai.beta.threads.create();
      let assistantId = assistant.id;
      let threadId = thread.id;
      await usersCollection.updateOne(
        { email: userEmail },
        { $set: { assistantId, threadId, isActive } }
      );
    } else {
      assistant = await openai.beta.assistants.update(user.assistantId, {
        instructions: description,
        name: name,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
        model: process.env.OPENAI_API_MODEL as string,
        file_ids: [],
      });
      let threadId = user.threadId;
      thread = await openai.beta.threads.retrieve(threadId as string);

      await usersCollection.updateOne(
        { email: userEmail },
        { $set: { isActive } }
      );
    }

    return NextResponse.json(
      {
        message: 'Assistant updated',
        assistantId: assistant.id,
        threadId: thread.id,
        isActive: user.isActive,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 500 });
  }
}
