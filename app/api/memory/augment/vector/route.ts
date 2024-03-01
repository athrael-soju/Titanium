import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';

import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userEmail, historyLength, embeddedMessage } = await req.json();
  try {
    if (userEmail) {
      const namespace = `${userEmail}_history`;
      const response = await pinecone.queryByNamespace(
        namespace,
        historyLength,
        embeddedMessage
      );

      return NextResponse.json({
        message: 'Pinecone message augmentation successful',
        namespace,
        response,
        status: 200,
      });
    } else {
      return sendErrorResponse(
        'Pinecone message augmentation cannot proceed without a valid user id',
        400
      );
    }
  } catch (error: any) {
    console.error(`Error Augmenting message with Vector database: ${error}`);
    return sendErrorResponse(
      `Error Augmenting message with Vector database`,
      400
    );
  }
}
