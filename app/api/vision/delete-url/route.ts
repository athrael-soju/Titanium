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

    if (user.visionId === file.visionId) {
      // Update the existing list with the new file
      const deleteFileResponse = await fileCollection.deleteOne({
        visionId: file.visionId,
      });

      return NextResponse.json({
        status: 200,
        message: 'Url deleted successfully',
        Response: deleteFileResponse,
      });
    } else {
      return NextResponse.json(
        { message: 'User VisionId not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Vision Url deletion unsuccessful:', error);
    return NextResponse.json(
      {
        message: 'Vision Url deletion unsuccessful',
        error,
      },
      { status: 500 }
    );
  }
}
