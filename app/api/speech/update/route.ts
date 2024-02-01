import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail, sendErrorResponse } from '@/app/lib/utils/db';
import { Collection } from 'mongodb';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { isTextToSpeechEnabled, userEmail, model, voice } =
      (await req.json()) as {
        isTextToSpeechEnabled: boolean;
        userEmail: string;
        model: string;
        voice: string;
      };

    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    await updateSpeech(
      user,
      usersCollection,
      isTextToSpeechEnabled,
      model,
      voice
    );

    return NextResponse.json(
      {
        message: 'Speech updated',
        isTextToSpeechEnabled: isTextToSpeechEnabled,
        model: model,
        voice: voice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in Speech update:', error);
    return sendErrorResponse('Error in Speech update', 500);
  }
}

async function updateSpeech(
  user: IUser,
  usersCollection: Collection<IUser>,
  isTextToSpeechEnabled: boolean,
  model: string,
  voice: string
): Promise<void> {
  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isTextToSpeechEnabled: isTextToSpeechEnabled,
        model: model,
        voice: voice,
      },
    }
  );
}
