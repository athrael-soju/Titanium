import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/client/mongodb';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    // Retrieve the userEmail from the request headers
    const userEmail = req.headers.get('userEmail');
    if (!userEmail) {
      return NextResponse.json('userEmail header is required', {
        status: 400,
      });
    }
    // Retrieve the user from the database
    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });
    let assistant,
      thread,
      fileList,
      filesWithNames: { id: string; name: string; assistantId: string }[] = [];
    if (!user) {
      return NextResponse.json('User not found', { status: 404 });
    }
    // If the user has an assistantId, retrieve the assistant from OpenAI
    if (user.assistantId) {
      assistant = await openai.beta.assistants.retrieve(user.assistantId);
      thread = await openai.beta.threads.retrieve(user.threadId as string);
      fileList = await openai.beta.assistants.files.list(user.assistantId);

      // Retrieve each file's metadata and construct a new array
      if (fileList?.data) {
        for (const fileObject of fileList.data) {
          const file = await openai.files.retrieve(fileObject.id);
          filesWithNames.push({
            id: fileObject.id,
            name: file.filename,
            assistantId: user.assistantId,
          });
        }
      }
      // Return a success response
      return NextResponse.json(
        {
          message: 'Assistant updated',
          assistant: assistant,
          threadId: thread?.id,
          fileList: filesWithNames,
          isAssistantEnabled: user.isAssistantEnabled,
        },
        { status: 200 }
      );
    }
    // Return a success response
    return NextResponse.json(
      {
        message: 'No assistant found',
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Return an error response
    return NextResponse.json(error.message, { status: 500 });
  }
}
