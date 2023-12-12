import OpenAI, { ClientOptions } from 'openai';
import clientPromise from '../../lib/client/mongodb';
import { NextRequest, NextResponse } from 'next/server';

//export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

export async function POST(req: NextRequest) {
  try {
    const { userMessage, userEmail } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    const openai = new OpenAI(options);

    if (user?.isAssistantEnabled) {
      const threadId = user.threadId as string;
      const assistantId = user.assistantId as string;

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
        console.log('Thread Run status:', run.status);
      }

      const messages = await openai.beta.threads.messages.list(threadId);

      const assistantMessage = messages.data.find(
        (message) => message.role === 'assistant'
      );

      if (!assistantMessage) {
        return NextResponse.json({ error: 'No assistant message found' });
      }

      const assistantMessageContent = assistantMessage.content.at(0);
      if (!assistantMessageContent) {
        return NextResponse.json({
          error: 'No assistant message content found',
        });
      }
      const data = assistantMessageContent.text.value;
      return new Response(data);
    } else {
      const completion = openai.beta.chat.completions.stream({
        model: process.env.OPENAI_API_MODEL ?? 'gpt-4-1106-preview',
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
      });

      // Construct and return a new Response object
      return new Response(completion.toReadableStream());
    }
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
