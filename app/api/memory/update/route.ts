import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  updateMemorySettings,
  getUserByEmail,
} from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { isLongTermMemoryEnabled, userEmail, memoryType, historyLength } =
      (await req.json()) as {
        isLongTermMemoryEnabled: boolean;
        userEmail: string;
        memoryType: string;
        historyLength: string;
      };
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    await updateMemorySettings(
      user,
      usersCollection,
      isLongTermMemoryEnabled,
      memoryType,
      historyLength
    );

    return NextResponse.json({
      message: 'Long term memory updated',
      isTextToSpeechEnabled: isLongTermMemoryEnabled,
      memoryType: memoryType,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error updating long term memory: ', error);
    return sendErrorResponse('Error updating long term memory', 400);
  }
}
