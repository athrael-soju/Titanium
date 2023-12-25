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

    const visionId = user.visionId;
    console.log('visionId', visionId);
    if (!visionId) {
      return NextResponse.json(
        { message: 'Vision ID not found for user' },
        { status: 404 }
      );
    }

    // Check if a list for the visionId exists
    const existingList = fileCollection.find({
      visionId: visionId,
    });
    console.log('existingList', existingList);
    if (existingList) {
      // Update the existing list with the new file
      await fileCollection.updateOne(
        { visionId: visionId },
        { $push: { files: file } }
      );
    } else {
      // Create a new list with the visionId
    }

    return NextResponse.json({ message: 'File processed successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'An error occurred', error: error },
      { status: 500 }
    );
  }
}
