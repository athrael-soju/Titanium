import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

interface UpdateFileStatusRequest {
  file: RagFile;
  userEmail: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestBody = await req.json();

  try {
    const db = await getDb();
    const { file, userEmail } = requestBody as UpdateFileStatusRequest;
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (user.ragId !== file.ragId) {
      return sendErrorResponse('User ragId not found', 404);
    }

    const fileCollection = db.collection<RagFile>('files');

    await fileCollection.updateOne(
      {
        ragId: file.ragId,
      },
      {
        $set: {
          processed: true,
        },
      }
    );
    file.processed = true;
    return NextResponse.json({
      message: 'R.A.G. file status updated successfully',
      file: file,
      status: 200,
    });
  } catch (error: any) {
    console.error('R.A.G. file status update failed:', error);
    return sendErrorResponse('R.A.G. file status update failed', 400);
  }
}
