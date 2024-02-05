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

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const fileName = req.headers.get('fileName') as string;
    const data = fs.readFileSync(fileName);
    let parsedDataResponse = await client.general.partition({
      files: {
        content: data,
        fileName: fileName,
      },
      // fast | hi_res | auto
      strategy: 'fast',
      pdfInferTableStructure: false,
    });

    return NextResponse.json(
      {
        message: 'Unstructured partition successful',
        file: parsedDataResponse?.elements,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unstructured partition failed', error);
    return sendErrorResponse('Unstructured partition failed', 400);
  }
}
