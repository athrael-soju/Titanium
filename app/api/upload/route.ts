import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/client/mongodb';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;
  const userEmail = data.get('userEmail');
  if (!userEmail) {
    return NextResponse.json('userEmail header is required', {
      status: 400,
    });
  }

  const client = await clientPromise;
  const db = client.db();

  // Retrieve the user from the database
  const usersCollection = db.collection<IUser>('users');
  const user = await usersCollection.findOne({ email: userEmail });
  if (!user) {
    return NextResponse.json('User not found', { status: 404 });
  }

  if (user.isAssistantEnabled) {
    try {
      // Save the file to the filesystem
      const tempFilePath = `./temp-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(tempFilePath, buffer);

      // Create a read stream from the saved file
      const fileStream = fs.createReadStream(tempFilePath);

      // Pass the read stream to openai.files.create
      const fileResponse = await openai.files.create({
        file: fileStream,
        purpose: 'assistants',
      });

      // Add the file to the assistant
      const addFileToAssistantResponse =
        await openai.beta.assistants.files.create(user.assistantId as string, {
          file_id: fileResponse.id,
        });

      // Delete the file after uploading
      fs.unlinkSync(tempFilePath);

      return NextResponse.json(
        {
          message: 'File uploaded',
          file: addFileToAssistantResponse,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        {
          message: 'Error processing file',
        },
        { status: 500 }
      );
    }
  } else {
    console.error('File uploads are only available with the assistant enabled');
    return NextResponse.json(
      {
        message: 'File uploads are only available with the assistant enabled',
      },
      { status: 400 }
    );
  }
}
