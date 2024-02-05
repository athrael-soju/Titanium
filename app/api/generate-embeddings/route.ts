import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';
import OpenAI, { ClientOptions } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const dataString = req.headers.get('data');
    if (!dataString) {
      throw new Error('No data provided in headers');
    }
    const data = JSON.parse(dataString);

    const embeddings = await Promise.all(
      data.map(async (item: any) => {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: item.text,
          encoding_format: 'float',
        });
        return response.data;
      })
    );

    return NextResponse.json(
      {
        message: 'Embeddings generated successfully',
        embeddings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error generating embeddings:', error);
    return sendErrorResponse('Error generating embeddings', 400);
  }
}
