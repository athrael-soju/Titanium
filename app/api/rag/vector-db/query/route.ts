import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const requestBody = await req.json();
    const { embeddedMessage, userEmail, topK } = requestBody;
    const { user } = await getDatabaseAndUser(db, userEmail);

    const ragId = user.ragId;
    if (ragId) {
      const response = await pinecone.queryByNamespace(
        ragId,
        topK,
        embeddedMessage
      );

      return NextResponse.json({
        message: 'Pinecone query successful',
        ragId: user.ragId,
        response,
        isRagEnabled: user.isRagEnabled,
        status: 200,
      });
    } else {
      return sendErrorResponse(
        'Query cannot proceed without a valid user ragId',
        400
      );
    }
  } catch (error: any) {
    console.error('Error querying Pinecone:', error);
    return sendErrorResponse('Error querying Pinecone: ', 400);
  }
}
