import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail, sendErrorResponse } from '@/app/lib/utils/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userEmail = req.headers.get('userEmail');
  const serviceName = req.headers.get('serviceName');

  if (!userEmail) {
    return sendErrorResponse('userEmail header is required', 400);
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (serviceName === 'vision' && user.visionId) {
      const fileCollection = db.collection<IFile>('files');
      const visionFileList = await fileCollection
        .find({ visionId: user.visionId })
        .toArray();

      return NextResponse.json(
        {
          message: 'Vision updated',
          visionId: user.visionId,
          visionFileList,
          isVisionEnabled: user.isVisionEnabled,
        },
        { status: 200 }
      );
    }

    return sendErrorResponse('Vision not configured for the user', 200);
  } catch (error: any) {
    console.error('Error retrieving vision:', error);
    return sendErrorResponse('Error retrieving vision', 500);
  }
}
