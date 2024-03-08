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

    if (serviceName === 'vision' && user.imageId) {
      const fileCollection = db.collection<ImageFile>('files');
      const imageFileList = await fileCollection
        .find({ imageId: user.imageId })
        .toArray();

      return NextResponse.json({
        message: 'Vision retrieved',
        imageId: user.imageId,
        imageFileList,
        isImageToTextEnabled: user.isImageToTextEnabled,
        status: 200,
      });
    } else {
      return sendInformationResponse('Vision not configured for the user', 202);
    }
  } catch (error: any) {
    console.error('Vision retrieval unsuccessful', error);
    return sendErrorResponse('Vision retrieval unsuccessful', 400);
  }
}
