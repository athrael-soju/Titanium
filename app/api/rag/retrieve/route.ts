import { NextRequest, NextResponse } from 'next/server';
import {
  getDatabaseAndUser,
  getDb,
  handleErrorResponse,
  sendErrorResponse,
} from '@/app/lib/utils/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const serviceName = req.headers.get('serviceName');
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (serviceName === 'rag') {
      const { isRagEnabled, ragId } = user;

      return NextResponse.json(
        {
          message: 'R.A.G. retrieved',
          isRagEnabled,
          ragId,
        },
        { status: 200 }
      );
    }

    return sendErrorResponse('R.A.G. not configured for the user', 200);
  } catch (error: any) {
    return handleErrorResponse(error);
  }
}
