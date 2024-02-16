import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import {
  sendErrorResponse,
  sendInformationResponse,
} from '@/app/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const serviceName = req.headers.get('serviceName');
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (serviceName === 'memory') {
      const { isLongTermMemoryEnabled, memoryType, historyLength } = user;

      return NextResponse.json({
        message: 'Long term memory retrieved',
        isLongTermMemoryEnabled,
        memoryType,
        historyLength,
        status: 200,
      });
    }
    return sendInformationResponse(
      'Long term memory not configured for the user',
      200
    );
  } catch (error: any) {
    console.error('Long term memory retrieval unsuccessful:', error);
    return sendErrorResponse('Long term memory retrieval unsuccessful', 400);
  }
}
