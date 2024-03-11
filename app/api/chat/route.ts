import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { ClientOptions } from 'openai';
import clientPromise from '../../lib/client/mongodb';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest) {
  return await handlePostRequest(req);
}

async function fetchAssistantMessage(
  threadId: string,
  assistantId: string,
  userMessage: string
) {
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage,
  });

  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  while (run.status !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data.find((message) => message.role === 'assistant');
}

async function handlePostRequest(req: NextRequest) {
  try {
    const { userMessage, userEmail } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isAssistantEnabled && user.assistantId && user.threadId) {
      const assistantMessage = await fetchAssistantMessage(
        user.threadId,
        user.assistantId,
        userMessage
      );

      if (!assistantMessage) {
        return NextResponse.json(
          { error: 'No assistant message found' },
          { status: 404 }
        );
      }

      const assistantMessageContent = assistantMessage.content.at(0);
      if (!assistantMessageContent || !('text' in assistantMessageContent)) {
        return NextResponse.json(
          { error: 'No valid assistant message content found' },
          { status: 404 }
        );
      }

      return new Response(assistantMessageContent.text.value);
    }
    let model = process.env.OPENAI_API_MODEL as string,
      content = userMessage;
    if (user.isImageToTextEnabled && user.imageToTextId) {
      model = 'gpt-4-vision-preview';
      content = [{ type: 'text', text: userMessage }] as any[];
      const fileCollection = db.collection<ImageToTextFile>('files');
      const imageToTextFileList = await fileCollection
        .find({ imageToTextId: user.imageToTextId })
        .toArray();

      if (imageToTextFileList) {
        imageToTextFileList.forEach((file: { url: any }) => {
          content.push({
            type: 'image_url',
            image_url: {
              url: file.url,
            },
          });
        });
      }
    }
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: content }],
      stream: true,
      max_tokens: 1024,
    });
    return new Response(response.toReadableStream());
  } catch (error: any) {
    console.error('Error processing request: ', error);
    return sendErrorResponse('Error processing request', 400);
  }
}
