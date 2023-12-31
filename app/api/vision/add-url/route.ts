import { NextRequest, NextResponse } from 'next/server';
import {
  getDatabaseAndUser,
  getDb,
  sendErrorResponse,
} from '@/app/lib/utils/db';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();

    const { file, userEmail } = await req.json();
    const { user } = await getDatabaseAndUser(db, userEmail);
    const usersCollection = db.collection<IUser>('users');
    if (!user.visionId) {
      console.log('No visionId found. Creating a new one');
      user.visionId = file.visionId;
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { visionId: user.visionId } }
      );
    }
    file.visionId = user.visionId;
    const fileCollection = db.collection<IFile>('files');
    const insertFileResponse = await fileCollection.insertOne(file);

    return NextResponse.json({
      message: 'File processed successfully',
      response: insertFileResponse,
      file: file,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return sendErrorResponse('Error processing file', 500);
  }
}
