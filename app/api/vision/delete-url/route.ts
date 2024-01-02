import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, sendErrorResponse } from '@/app/lib/utils/db';
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { db, user, file } = await getDatabaseAndUser(req);

    if (user.visionId !== file.visionId) {
      return sendErrorResponse('User VisionId not found', 404);
    }

    const fileCollection = db.collection<IFile>('files');
    const deleteFileResponse = await fileCollection.deleteOne({
      visionId: file.visionId,
    });

    return NextResponse.json({
      status: 200,
      message: 'Url deleted successfully',
      response: deleteFileResponse,
    });
  } catch (error) {
    return sendErrorResponse('Error deleting file', 500);
  }
}
