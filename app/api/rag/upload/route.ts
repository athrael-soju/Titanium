import { NextRequest, NextResponse } from 'next/server';
import { getDb, sendErrorResponse, getUserByEmail } from '@/app/lib/utils/db';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface FileUploadResponse {
  filename: string;
  ragId: string;
  fileId: string;
  purpose: string;
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

    if (user.ragId) {
      const fileResponse = await writeFile(user, file);
      return NextResponse.json(
        { message: 'File uploaded', fileResponse },
        { status: 200 }
      );
    } else {
      return sendErrorResponse(
        'R.A.G. must be initialized before files can be uploaded',
        400
      );
    }
  } catch (error: any) {
    console.error('Error processing file:', error);
    return sendErrorResponse('Error processing file', 500);
  }
}

async function writeFile(user: IUser, file: File): Promise<FileUploadResponse> {
  try {
    const filePath = join(tmpdir(), file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const response = {
      filename: filePath,
      ragId: user.ragId as string,
      fileId: crypto.randomUUID(),
      purpose: 'R.A.G.',
    };

    return response;
  } catch (error: any) {
    console.error('Error in file upload to R.A.G.:', error);
    throw new Error('File upload to R.A.G. failed');
  }
}
