import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { file, userEmail } = await req.json();

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.visionId) {
      console.log('No visionId found. Creating a new one');
      await usersCollection.updateOne(
        { email: user.email },
        {
          $set: {
            visionId: file.visionId,
          },
        }
      );
    }
    file.visionId = user.visionId;
    const fileCollection = db.collection<IFiles>('files');
    const insertFileResponse = await fileCollection.insertOne(file);

    return NextResponse.json({
      message: 'File processed successfully',
      Response: insertFileResponse,
      file: file,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'An error occurred', error: error },
      { status: 500 }
    );
  }
}
