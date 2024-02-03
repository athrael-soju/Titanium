import { NextRequest, NextResponse } from 'next/server';
import {
  getDatabaseAndUser,
  getDb,
  handleErrorResponse,
  sendErrorResponse,
} from '@/app/lib/utils/db';

import { queryByNamespace } from '@/app/lib/client/pinecone';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const data = req.headers.get('data');
    const { user } = await getDatabaseAndUser(db, userEmail);
    if (user.ragId) {
      const response = await queryByNamespace(data, user);

      return NextResponse.json(
        {
          message: 'Pinecone query successful',
          ragId: user.ragId,
          response,
          isRagEnabled: user.isRagEnabled,
        },
        { status: 200 }
      );
    } else {
      return sendErrorResponse(
        'Query cannot proceed without a valid user ragId',
        200
      );
    }
  } catch (error: any) {
    return handleErrorResponse(error);
  }
}
