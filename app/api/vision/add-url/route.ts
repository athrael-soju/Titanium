import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { userEmail, isVisionEnabled, visionFiles } = await req.json();

    if (!userEmail || isVisionEnabled === undefined) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { vision } = await updateVision(
      user,
      isVisionEnabled,
      usersCollection,
      visionFiles
    );

    return NextResponse.json(
      {
        message: 'Vision updated',
        visionId: vision.id,
        visionFiles: vision.files,
        isVisionEnabled,
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

async function updateVision(
  user: IUser,
  isVisionEnabled: boolean,
  usersCollection: any,
  visionFiles: any
) {
  return {
    vision: {
      id: 'vision',
      files: visionFiles,
    },
  };
}
