import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { file, userEmail } = await req.json();
    const { user } = await getDatabaseAndUser(db, userEmail);
    if (user.textToImageId !== file.textToImageId) {
      return sendErrorResponse('User textToImageId not found', 404);
    }

    const fileCollection = db.collection<VisionFile>('files');
    const deleteFileResponse = await fileCollection.deleteOne({
      textToImageId: file.textToImageId,
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
