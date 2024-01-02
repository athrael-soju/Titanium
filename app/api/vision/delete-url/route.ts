import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail, sendErrorResponse } from '@/app/lib/utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { file, userEmail } = (await req.json()) as {
      file: IFile;
      userEmail: string;
    };

    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (user.visionId === file.visionId) {
      const fileCollection = db.collection<IFile>('files');
      const deleteFileResponse = await fileCollection.deleteOne({
        visionId: file.visionId,
      });

      return NextResponse.json({
        status: 200,
        message: 'Url deleted successfully',
        response: deleteFileResponse,
      });
    } else {
      return sendErrorResponse('User VisionId not found', 404);
    }
  } catch (error: any) {
    console.error('Vision Url deletion unsuccessful:', error);
    return sendErrorResponse('Vision Url deletion unsuccessful', 500);
  }
}
