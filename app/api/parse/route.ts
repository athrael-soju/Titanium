import { NextRequest, NextResponse } from 'next/server';
import { UnstructuredClient } from 'unstructured-client';
import * as fs from 'fs';

import { sendErrorResponse } from '@/app/lib/utils/response';

const apiKey = process.env.UNSTRUCTURED_API as string;

const client = new UnstructuredClient({
  security: {
    apiKeyAuth: apiKey,
  },
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { file, parsingStrategy } = await req.json();
    const fileData = fs.readFileSync(file.path);
    let parsedDataResponse = await client.general.partition({
      files: {
        content: fileData,
        fileName: file.name,
      },
      strategy: parsingStrategy,
      pdfInferTableStructure: false,
    });

    return NextResponse.json({
      message: 'Unstructured partition parsed successfully',
      file: parsedDataResponse?.elements,
      status: 200,
    });
  } catch (error: any) {
    console.error('Unstructured partition failed to parse', error);
    return sendErrorResponse('Unstructured partition failed to parse', 400);
  }
}
