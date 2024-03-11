import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';
import OpenAI from 'openai';
import { Collection } from 'mongodb';

const openai = new OpenAI();

import { sendErrorResponse } from '@/app/lib/utils/response';

interface AssistantUpdateRequest {
  userEmail: string;
  name: string;
  description: string;
  isAssistantEnabled: boolean;
  files: { name: string; id: string; assistantId: string }[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const requestBody = await req.json();
    const { userEmail, name, description, isAssistantEnabled, files } =
      requestBody as AssistantUpdateRequest;

    if (
      !userEmail ||
      !name ||
      !description ||
      isAssistantEnabled === undefined
    ) {
      return sendErrorResponse('Missing required parameters', 400);
    }

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    const { assistant, thread } = await createOrUpdateAssistant(
      user,
      name,
      description,
      isAssistantEnabled,
      usersCollection,
      files
    );

    return NextResponse.json({
      message: 'Assistant updated',
      assistantId: assistant.id,
      threadId: thread.id,
      isAssistantEnabled,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in assistant update: ', error);
    return sendErrorResponse('Error in assistant update', 400);
  }
}

async function createOrUpdateAssistant(
  user: IUser,
  name: string,
  description: string,
  isAssistantEnabled: boolean,
  usersCollection: Collection<IUser>,
  files: { name: string; id: string; assistantId: string }[]
): Promise<{ assistant: any; thread: any }> {
  let assistant, thread;
  const isImageToTextEnabled = isAssistantEnabled ? false : user.isImageToTextEnabled;
  const isRagEnabled = isAssistantEnabled ? false : user.isRagEnabled;

  if (!user.assistantId) {
    // Create a new assistant and thread
    assistant = await openai.beta.assistants.create({
      instructions: description,
      name: name,
      tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
      model: process.env.OPENAI_API_MODEL as string,
      file_ids: files.map((file) => file.id),
    });
    thread = await openai.beta.threads.create();
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
  }

  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        assistantId: assistant.id,
        threadId: thread.id,
        isAssistantEnabled: isAssistantEnabled,
        isImageToTextEnabled: isImageToTextEnabled,
        isRagEnabled: isRagEnabled,
      },
    }
  );

  return { assistant, thread };
}
