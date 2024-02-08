import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';
import fs from 'fs/promises';

interface DeleteFileRequest {
  file: RagFile;
  userEmail: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestBody = await req.json();

  try {
    const db = await getDb();
    const { file, userEmail } = requestBody as DeleteFileRequest;
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (user.ragId !== file.ragId) {
      return sendErrorResponse('User ragId not found', 404);
    }

    const fileCollection = db.collection<RagFile>('files');

    const fileDeletedFromDB = await fileCollection.deleteOne({
      ragId: file.ragId,
    });
    const fileDeletedFromDisk = await fs.unlink(file.path);
    return NextResponse.json({
      fileDeletedFromDisk: fileDeletedFromDisk,
      fileDeletedFromDB: fileDeletedFromDB,
      status: 200,
    });
  } catch (error: any) {
    console.error('R.A.G. file deletion unsuccessful: ', error);
    return sendErrorResponse('R.A.G. file deletion unsuccessful', 400);
  }
}
