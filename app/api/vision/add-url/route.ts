import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail, sendErrorResponse } from '@/app/lib/utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { file, userEmail } = (await req.json()) as {
      file: IFile;
      userEmail: string;
    };

    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (!user.visionId) {
      console.log('No visionId found. Creating a new one');
      user.visionId = file.visionId;
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { visionId: user.visionId } }
      );
    }

    const fileCollection = db.collection<IFile>('files');
    const insertFileResponse = await fileCollection.insertOne(file);

    return NextResponse.json(
      {
        message: 'File processed successfully',
        response: insertFileResponse,
        file: file,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return sendErrorResponse('An error occurred', 500);
  }
}
