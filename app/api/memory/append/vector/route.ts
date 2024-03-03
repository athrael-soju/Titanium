import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';
import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userEmail, vectorMessage } = await req.json();
  try {
    if (userEmail) {
      const nameSpace = `${userEmail}_history`;
      const response = await pinecone.upsertOne([vectorMessage], nameSpace);
      if (response.success === false) {
        return sendErrorResponse(
          'Error appending message to Vector database',
          400
        );
      }
      return NextResponse.json({
        message: `Conversation message appended via Vector database.`,
        id: userEmail,
        response,
        status: 200,
      });
    } else {
      return sendErrorResponse(
        'Append cannot proceed without a valid user userEmail',
        400
      );
    }
  } catch (error: any) {
    console.error(`Error appending message to Vector database: ${error}`);
    return sendErrorResponse(`Error appending message to Vector database`, 400);
  }
}
