import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail, sendErrorResponse } from '@/app/lib/utils';
import { Collection } from 'mongodb';

async function updateVision(
  user: IUser,
  usersCollection: Collection<IUser>,
  isVisionEnabled: boolean
): Promise<void> {
  let isAssistantEnabled = isVisionEnabled ? false : user.isAssistantEnabled;

  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isAssistantEnabled: isAssistantEnabled,
        isVisionEnabled: isVisionEnabled,
      },
    }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { isVisionEnabled, userEmail } = (await req.json()) as {
      isVisionEnabled: boolean;
      userEmail: string;
    };

    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    await updateVision(user, usersCollection, isVisionEnabled);

    return NextResponse.json(
      {
        message: 'Vision updated',
        visionId: user.visionId,
        isVisionEnabled: isVisionEnabled,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in vision update:', error);
    return sendErrorResponse('Error in vision update', 500);
  }
}
