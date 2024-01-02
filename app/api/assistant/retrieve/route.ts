import { NextRequest, NextResponse } from 'next/server';
import { getDb, sendErrorResponse, getUserByEmail } from '@/app/lib/utils/db';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userEmail = req.headers.get('userEmail');
  const serviceName = req.headers.get('serviceName');

  if (!userEmail) {
    return sendErrorResponse('userEmail header is required', 400);
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (serviceName === 'assistant' && user.assistantId) {
      const [assistant, thread, fileList] = await Promise.all([
        openai.beta.assistants.retrieve(user.assistantId),
        openai.beta.threads.retrieve(user.threadId as string),
        openai.beta.assistants.files.list(user.assistantId),
      ]);

      const filesWithNames = await Promise.all(
        fileList.data.map(async (fileObject) => {
          const file = await openai.files.retrieve(fileObject.id);
          return {
            id: fileObject.id,
            name: file.filename,
            assistantId: user.assistantId,
          };
        })
      );

      return NextResponse.json(
        {
          message: 'Assistant retrieved',
          assistant,
          threadId: thread?.id,
          fileList: filesWithNames,
          isAssistantEnabled: user.isAssistantEnabled,
        },
        { status: 200 }
      );
    }

    return sendErrorResponse('Assistant not configured for the user', 200);
  } catch (error: any) {
    return sendErrorResponse('Error retrieving assistant', 500);
  }
}
