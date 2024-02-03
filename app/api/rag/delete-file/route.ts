import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

interface DeleteFileRequest {
  file: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestBody = await req.json();
  const { file } = requestBody as DeleteFileRequest;

  try {
    const fileDeletedFromDisk = await fs.unlink(file);
    const fileDeletedFromVectorDB = true;
    return NextResponse.json(
      {
        fileDeletedFromDisk: fileDeletedFromDisk,
        fileDeletedFromVectorDB: fileDeletedFromVectorDB,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('R.A.G. file deletion unsuccessful:', error);
    return NextResponse.json(
      {
        message: 'R.A.G. file deletion unsuccessful',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
