import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail } from '@/app/lib/utils/db';
import {sendErrorResponse } from '@/app/lib/utils/response';
import fs from 'fs/promises';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const openai = new OpenAI();

interface FileUploadResponse {
  id: string;
  object: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;
  const userEmail = data.get('userEmail') as string;

  try {
    const db = await getDb();
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);

    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (user.assistantId) {
      const fileResponse = await addFileToAssistant(user, file);
      return NextResponse.json(
        { message: 'File uploaded', file: fileResponse },
        { status: 200 }
      );
    } else {
      return sendErrorResponse(
        'Assistant must be created before files can be uploaded',
        400
      );
    }
  } catch (error: any) {
    console.error('Error processing file:', error);
    return sendErrorResponse('Error processing file', 500);
  }
}

async function addFileToAssistant(
  user: IUser,
  file: File
): Promise<FileUploadResponse> {
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

    return await openai.beta.assistants.files.create(
      user.assistantId as string,
      {
        file_id: fileResponse.id,
      }
    );
  } catch (error: any) {
    console.error('Error in file upload to assistant:', error);
    throw new Error('File upload to assistant failed');
  } finally {
    await fs.unlink(tempFilePath);
  }
}
