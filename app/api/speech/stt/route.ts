import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { ClientOptions } from 'openai';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest) {
  const tempFilePath = join(tmpdir(), 'audio.mp3');
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (file && file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(tempFilePath, buffer);
      const fileStream = createReadStream(tempFilePath);

      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
      });
      return new NextResponse(transcription.text);
    } else {
      return sendErrorResponse('File not provided or incorrect format', 400);
    }
  } catch (error) {
    console.error('Error generating transcript from speech', error);
    return sendErrorResponse('Error generating transcript from speech', 400);
  } finally {
    await fs.unlink(tempFilePath);
  }
}
