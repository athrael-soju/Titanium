import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import {
  sendErrorResponse,
  sendInformationResponse,
} from '@/app/lib/utils/response';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const serviceName = req.headers.get('serviceName');
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (serviceName === 'speech') {
      const { isTextToSpeechEnabled, model, voice } = user;

      return NextResponse.json({
        message: 'Speech retrieved',
        isTextToSpeechEnabled,
        model,
        voice,
        status: 200,
      });
    }
    return sendInformationResponse('Speech not configured for the user', 200);
  } catch (error: any) {
    return sendErrorResponse('Failed to retrieve Speech', 400);
  }
}
