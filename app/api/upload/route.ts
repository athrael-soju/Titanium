import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/client/mongodb';
import fs from 'fs/promises';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const openai = new OpenAI();

async function processFileUpload(user: IUser, file: File) {
  const tempFilePath = join(tmpdir(), file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(tempFilePath, buffer);

  try {
    const fileStream = createReadStream(tempFilePath);
    const fileResponse = await openai.files.create({
      file: fileStream,
      purpose: 'assistants',
    });

    const addFileToAssistantResponse =
      await openai.beta.assistants.files.create(user.assistantId as string, {
        file_id: fileResponse.id,
      });

    return addFileToAssistantResponse;
  } finally {
    await fs.unlink(tempFilePath);
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;
  const userEmail = data.get('userEmail') as string;

  if (!userEmail) {
    return NextResponse.json(
      { message: 'User email is required' },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection<IUser>('users');
  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  if (user.isAssistantEnabled) {
    try {
      const addFileToAssistantResponse = await processFileUpload(user, file);
      return NextResponse.json(
        { message: 'File uploaded', file: addFileToAssistantResponse },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { message: 'Error processing file' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: 'Assistant must be enabled to upload files' },
      { status: 400 }
    );
  }
}
