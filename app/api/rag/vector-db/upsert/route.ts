import { NextRequest, NextResponse } from 'next/server';
import {
  getDatabaseAndUser,
  getDb,
  handleErrorResponse,
  sendErrorResponse,
} from '@/app/lib/utils/db';

import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();

    const requestBody = await req.json();
    const { data, userEmail } = requestBody;
    const { user } = await getDatabaseAndUser(db, userEmail);
    if (user.ragId) {
      const response = await pinecone.upsert(data, user);

      return NextResponse.json(
        {
          message: 'Pinecone upsert successful',
          ragId: user.ragId,
          response,
          isRagEnabled: user.isRagEnabled,
        },
        { status: 200 }
      );
    } else {
      return sendErrorResponse(
        'Upsert cannot proceed without a valid user ragId',
        200
      );
    }
  } catch (error: any) {
    return handleErrorResponse(error);
  }
}
