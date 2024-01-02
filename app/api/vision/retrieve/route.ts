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
    return handleErrorResponse(error);
  }
}
