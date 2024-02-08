import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

import { pinecone } from '@/app/lib/client/pinecone';

interface DeleteFileRequest {
  file: RagFile;
  userEmail: string;
  chunkBatch: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestBody = await req.json();

  try {
    const db = await getDb();
    const { file, userEmail, chunkBatch } = requestBody as DeleteFileRequest;
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (user.ragId !== file.ragId) {
      return sendErrorResponse('User ragId not found', 404);
    }
    const fileDeletedFromVectorDB = await pinecone.deleteMany(
      file.chunks,
      user,
      chunkBatch
    );
    if (fileDeletedFromVectorDB.success === false) {
      return sendErrorResponse('Vector DB file deletion unsuccessful', 400);
    }
    return NextResponse.json({
      message: 'Vector DB file deletion successful',
      fileDeletedFromVectorDB: fileDeletedFromVectorDB,
      status: 200,
    });
  } catch (error: any) {
    console.error('Vector DB file deletion unsuccessful: ', error);
    return sendErrorResponse('Vector DB file deletion unsuccessful', 400);
  }
}
