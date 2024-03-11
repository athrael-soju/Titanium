import { NextRequest, NextResponse } from 'next/server';
import { Collection } from 'mongodb';
import { getDb, getUserByEmail } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

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

    return NextResponse.json({
      message: 'Vision updated',
      textToImageId: user.textToImageId,
      isVisionEnabled: isVisionEnabled,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in vision update: ', error);
    return sendErrorResponse('Error in vision update', 400);
  }
}

async function updateVision(
  user: IUser,
  usersCollection: Collection<IUser>,
  isVisionEnabled: boolean
): Promise<void> {
  let disableOtherServices = isVisionEnabled ? false : user.isAssistantEnabled;
  let textToImageId = user.textToImageId;
  if (!textToImageId) {
    console.log('No textToImageId found. Creating a new one');
    textToImageId = crypto.randomUUID();
  }
  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isAssistantEnabled: disableOtherServices,
        isRagEnabled: disableOtherServices,
        isVisionEnabled: isVisionEnabled,
        textToImageId: textToImageId,
      },
    }
  );
}
