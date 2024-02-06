import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';
import { Collection } from 'mongodb';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { isRagEnabled, userEmail } = (await req.json()) as {
      isRagEnabled: boolean;
      userEmail: string;
    };

    const usersCollection = db.collection<IUser>('users');
    const fileCollection = db.collection<RagFile>('files');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }
    await updateRag(user, usersCollection, isRagEnabled);

    const ragId = user.ragId as string;
    const ragFile = await fileCollection.findOne({ ragId: ragId });

    return NextResponse.json({
      message: 'R.A.G. updated',
      ragId: user.ragId,
      isRagEnabled: isRagEnabled,
      ragFile: ragFile,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in R.A.G. update:', error);
    return sendErrorResponse('Error in R.A.G. update', 400);
  }
}

async function updateRag(
  user: IUser,
  usersCollection: Collection<IUser>,
  isRagEnabled: boolean
): Promise<void> {
  let isAssistantEnabled = isRagEnabled ? false : user.isAssistantEnabled;
  let ragId = user.ragId;
  if (!ragId) {
    console.log('No ragId found. Creating a new one');
    ragId = crypto.randomUUID();
  }

  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isRagEnabled: isRagEnabled,
        isAssistantEnabled: isAssistantEnabled,
        ragId: ragId,
      },
    }
  );
}