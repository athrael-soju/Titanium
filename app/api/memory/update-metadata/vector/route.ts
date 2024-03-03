import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';
import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { id, metadata, userEmail } = await req.json();
  try {
    if (id) {
      const nameSpace = `${userEmail}_history`;
      const response = await pinecone.updateMetadata(id, metadata, nameSpace);
      if (response.success === false) {
        return sendErrorResponse(
          'Error updating metadata in Vector database',
          400
        );
      }
      return NextResponse.json({
        message: `Metadata updated in Vector database.`,
        id: userEmail,
        response,
        status: 200,
      });
    } else {
      return sendErrorResponse(
        'Metadata update cannot proceed without a valid id',
        400
      );
    }
  } catch (error: any) {
    console.error(`Error updating metadata in Vector database: ${error}`);
    return sendErrorResponse(`Error updating metadata in Vector database`, 400);
  }
}
