import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendErrorResponse } from '@/app/lib/utils/response';

const openai = new OpenAI();

interface DeleteFileRequest {
  file: {
    id: string;
    assistantId: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestBody = await req.json();
  const { file } = requestBody as DeleteFileRequest;

  try {
    const assistantFileDeletionResponse =
      await openai.beta.assistants.files.del(file.assistantId, file.id);
    const openaiFileDeletionResponse = await openai.files.del(file.id);

    return NextResponse.json({
      message: 'File deleted successfully',
      assistantFileDeletionResponse,
      openaiFileDeletionResponse,
      status: 200,
    });
  } catch (error: any) {
    console.error('Assistant file deletion unsuccessful:', error);
    return sendErrorResponse('Assistant file deletion unsuccessful', 500);
  }
}
