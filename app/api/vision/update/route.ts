import { NextRequest, NextResponse } from 'next/server';
import { Collection } from 'mongodb';
import { getDb, getUserByEmail } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { isImageToTextEnabled, userEmail } = (await req.json()) as {
      isImageToTextEnabled: boolean;
      userEmail: string;
    };

    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    await updateVision(user, usersCollection, isImageToTextEnabled);

    return NextResponse.json({
      message: 'Vision updated',
      imageToTextId: user.imageToTextId,
      isImageToTextEnabled: isImageToTextEnabled,
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
  isImageToTextEnabled: boolean
): Promise<void> {
  let disableOtherServices = isImageToTextEnabled ? false : user.isAssistantEnabled;
  let imageToTextId = user.imageToTextId;
  if (!imageToTextId) {
    console.log('No imageToTextId found. Creating a new one');
    imageToTextId = crypto.randomUUID();
  }
  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isAssistantEnabled: disableOtherServices,
        isRagEnabled: disableOtherServices,
        isImageToTextEnabled: isImageToTextEnabled,
        imageToTextId: imageToTextId,
      },
    }
  );
}
