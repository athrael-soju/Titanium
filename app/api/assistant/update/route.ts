import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';
import OpenAI from 'openai';

const openai = new OpenAI();

async function createOrUpdateAssistant(
  user: IUser,
  name: string,
  description: string,
  isAssistantEnabled: boolean,
  usersCollection: any,
  files: { name: string; id: string; assistandId: string }[]
) {
  let assistant,
    thread,
    isVisionEnabled = user.isVisionEnabled;
  if (isAssistantEnabled) {
    isVisionEnabled = false;
  }
  if (!user.assistantId) {
    // Create a new assistant and thread
    assistant = await openai.beta.assistants.create({
      instructions: description,
      name: name,
      tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
      model: process.env.OPENAI_API_MODEL as string,
      file_ids: [],
    });
    thread = await openai.beta.threads.create();
    await usersCollection.updateOne(
      { email: user.email },
      {
        $set: {
          assistantId: assistant.id,
          threadId: thread.id,
          isAssistantEnabled: isAssistantEnabled,
          isVisionEnabled: isVisionEnabled,
        },
      }
    );
  } else {
    // Update an existing assistant
    assistant = await openai.beta.assistants.update(user.assistantId, {
      instructions: description,
      name: name,
      tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
      model: process.env.OPENAI_API_MODEL as string,
      file_ids: files.map((file) => file.id),
    });
    thread = await openai.beta.threads.retrieve(user.threadId as string);
    await usersCollection.updateOne(
      { email: user.email },
      {
        $set: {
          isAssistantEnabled: isAssistantEnabled,
          isVisionEnabled: isVisionEnabled,
        },
      }
    );
  }
  return { assistant, thread };
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { userEmail, name, description, isAssistantEnabled, files } =
      await req.json();

    if (
      !userEmail ||
      !name ||
      !description ||
      isAssistantEnabled === undefined
    ) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { assistant, thread } = await createOrUpdateAssistant(
      user,
      name,
      description,
      isAssistantEnabled,
      usersCollection,
      files
    );

    return NextResponse.json(
      {
        message: 'Assistant updated',
        assistantId: assistant.id,
        threadId: thread.id,
        isAssistantEnabled,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in assistant update:', error);
    return NextResponse.json(
      { message: 'Error in assistant update', error: error.message },
      { status: 500 }
    );
  }
}
