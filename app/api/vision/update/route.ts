import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';

async function updateVision(
  user: IUser,
  usersCollection: any,
  isVisionEnabled: boolean
) {
  let isAssistantEnabled = user.isAssistantEnabled;
  if (isVisionEnabled) {
    isAssistantEnabled = false;
  }
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

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { isVisionEnabled, userEmail } = await req.json();

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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
    console.error('Error in assistant update:', error);
    return NextResponse.json(
      { message: 'Error in assistant update', error: error.message },
      { status: 500 }
    );
  }
}
