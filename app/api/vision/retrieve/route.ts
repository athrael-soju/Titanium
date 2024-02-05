import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import {
  handleErrorResponse,
  sendInformationResponse,
} from '@/app/lib/utils/response';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const serviceName = req.headers.get('serviceName');
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (serviceName === 'vision' && user.visionId) {
      const fileCollection = db.collection<VisionFile>('files');
      const visionFileList = await fileCollection
        .find({ visionId: user.visionId })
        .toArray();

      return NextResponse.json(
        {
          message: 'Vision retrieved',
          visionId: user.visionId,
          visionFileList,
          isVisionEnabled: user.isVisionEnabled,
        },
        { status: 200 }
      );
    } else {
      return sendInformationResponse('Vision not configured for the user', 200);
    }
  } catch (error: any) {
    return handleErrorResponse(error);
  }
}
