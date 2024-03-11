import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();

    const { file, userEmail } = await req.json();
    const { user } = await getDatabaseAndUser(db, userEmail);
    let imageToTextId;
    const usersCollection = db.collection<IUser>('users');
    if (!user.imageToTextId) {
      console.log('No imageToTextId found. Creating a new one');
      imageToTextId = crypto.randomUUID();
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { imageToTextId: imageToTextId } }
      );
    } else {
      imageToTextId = user.imageToTextId;
    }
    file.imageToTextId = imageToTextId;
    const fileCollection = db.collection<ImageToTextFile>('files');
    const insertFileResponse = await fileCollection.insertOne(file);

    return NextResponse.json({
      message: 'File upload successful',
      response: insertFileResponse,
      file: file,
      status: 200,
    });
  } catch (error) {
    console.error('Error processing file: ', error);
    return sendErrorResponse('Error processing file: ', 500);
  }
}
