import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';
import OpenAI, { ClientOptions } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const dataString = req.headers.get('data');
    const userEmail = req.headers.get('userEmail');
    if (!userEmail || !dataString) {
      throw new Error(
        'Incomplete request headers. Please provide userEmail and data.'
      );
    }
    const data = JSON.parse(dataString);
    const { user } = await getDatabaseAndUser(db, userEmail);

    console.log('User:', user, 'Data:', data);
    const embeddings = await Promise.all(
      data.map(async (item: any) => {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: item.text,
          encoding_format: 'float',
        });

        const embeddingValues = response.data[0].embedding;
        return {
          id: crypto.randomUUID(),
          values: embeddingValues,
          metadata: {
            ...item.metadata,
            rag_id: user.ragId,
            user_email: user.email,
          },
        };
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
