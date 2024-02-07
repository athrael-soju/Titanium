import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import {
  sendErrorResponse,
  sendInformationResponse,
} from '@/app/lib/utils/response';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const userEmail = req.headers.get('userEmail') as string;
    const serviceName = req.headers.get('serviceName');
    const { user } = await getDatabaseAndUser(db, userEmail);

    if (serviceName === 'rag' && user.ragId) {
      const fileCollection = db.collection<RagFile>('files');
      const ragFileList = await fileCollection
        .find({ ragId: user.ragId })
        .toArray();
      return NextResponse.json(
        {
          message: 'R.A.G. retrieved',
          ragId: user.ragId,
          topK: user.topK,
          chunkBatch: user.chunkBatch,
          ragFileList,
          isRagEnabled: user.isRagEnabled,
        },
        { status: 200 }
      );
    } else {
      return sendInformationResponse('R.A.G. not configured for the user', 200);
    }
  } catch (error: any) {
    return sendErrorResponse(error, 400);
  }
}
