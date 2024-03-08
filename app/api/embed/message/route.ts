import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';
import OpenAI, { ClientOptions } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await req.json();
    const { message } = requestBody;

    if (!message) {
      throw new Error('Incomplete request headers. Please mesage.');
    }
    const messageToEmbed = `Date: ${message.createdAt}. User: ${message.conversationId}. Message: ${message.text}. Metadata: ${message.metadata}`;
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: messageToEmbed,
      encoding_format: 'float',
    });

    const embeddingValues = response.data[0].embedding;

    return NextResponse.json({
      message: 'Message embeddings generated successfully',
      values: embeddingValues,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error generating message embeddings: ', error);
    return sendErrorResponse('Error generating message embeddings', 400);
  }
}
