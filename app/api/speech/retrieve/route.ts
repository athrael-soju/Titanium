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

    if (serviceName === 'speech') {
      const { isTextToSpeechEnabled, model, voice } = user;

      return NextResponse.json(
        {
          message: 'Speech retrieved',
          isTextToSpeechEnabled,
          model,
          voice,
        },
        { status: 200 }
      );
    }

    return sendErrorResponse('Speech not configured for the user', 200);
  } catch (error: any) {
    return handleErrorResponse(error);
  }
}
