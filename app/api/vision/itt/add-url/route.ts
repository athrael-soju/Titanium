import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();

    const { file, userEmail } = await req.json();
    const { user } = await getDatabaseAndUser(db, userEmail);
    let imageId;
    const usersCollection = db.collection<IUser>('users');
    if (!user.imageId) {
      console.log('No imageId found. Creating a new one');
      imageId = crypto.randomUUID();
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { imageId: imageId } }
      );
    } else {
      imageId = user.imageId;
    }
    file.imageId = imageId;
    const fileCollection = db.collection<ImageFile>('files');
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
