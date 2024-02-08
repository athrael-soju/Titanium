import { NextRequest, NextResponse } from 'next/server';
import { getDb, getUserByEmail } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface FileUploadResponse {
  fileWrittenToDisk: boolean;
  uploadPath: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.formData();
    const file = data.get('file') as unknown as File;
    const userEmail = data.get('userEmail') as string;
    const db = await getDb();
    const usersCollection = db.collection<IUser>('users');
    const user = await getUserByEmail(usersCollection, userEmail);
    let ragId;
    if (!user) {
      return sendErrorResponse('User not found', 404);
    }

    if (!user.ragId) {
      console.log('No ragId found. Creating a new one');
      ragId = crypto.randomUUID();
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { ragId: ragId } }
      );
    } else {
      ragId = user.ragId;
    }

    const fileWriteResponse = await writeFile(file);

    const dbFile = {
      id: crypto.randomUUID(),
      name: file.name,
      path: fileWriteResponse.uploadPath,
      ragId: ragId,
      purpose: 'R.A.G.',
      processed: false,
      chunks: [],
    };

    const fileCollection = db.collection<RagFile>('files');
    const insertFileToDBResponse = await fileCollection.insertOne(dbFile);

    return NextResponse.json({
      message: 'File upload successful',
      file: dbFile,
      fileWrittenToDisk: fileWriteResponse.fileWrittenToDisk,
      fileWrittenToDb: insertFileToDBResponse.insertedId,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error processing file: ', error);
    return sendErrorResponse('Error processing file', 500);
  }
}

async function writeFile(file: File): Promise<FileUploadResponse> {
  try {
    const uploadPath = join(tmpdir(), file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(uploadPath, buffer);

    const response = {
      fileWrittenToDisk: true,
      uploadPath: uploadPath,
    };

    return response;
  } catch (error: any) {
    console.error('Error in file upload to R.A.G.: ', error);
    throw new Error('File upload to R.A.G. failed');
  }
}
