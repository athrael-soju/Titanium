import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/client/mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { file, userEmail } = await req.json();

    if (!userEmail || !file) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const usersCollection = db.collection<IUser>('users');
    const fileCollection = db.collection<IFiles>('files');

    // Retrieve the user's visionId
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
            visionId: user.visionId,
          },
        }
      );
    }

    // Update the existing list with the new file
    const insertFileResponse = await fileCollection.insertOne(file);

    return NextResponse.json({
      message: 'File processed successfully',
      Response: insertFileResponse,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'An error occurred', error: error },
      { status: 500 }
    );
  }
}
