import { NextRequest, NextResponse } from 'next/server';
import {
  getDatabaseAndUser,
  getDb,
  sendErrorResponse,
} from '@/app/lib/utils/db';
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { file, userEmail } = await req.json();
    const { user } = await getDatabaseAndUser(db, userEmail);
    if (user.visionId !== file.visionId) {
      return sendErrorResponse('User visionId not found', 404);
    }

    const fileCollection = db.collection<VisionFile>('files');
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
