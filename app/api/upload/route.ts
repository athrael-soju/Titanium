import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { createReadStream } from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;
  const assistantId = data.get('assistantId') as string;

  if (!file) {
    console.log('No file found in the request');
    return NextResponse.json({ success: false });
  }

  // Convert file to buffer and write to a temporary location
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `/tmp/${file.name}`;
  await writeFile(path, buffer);
  console.log(`File written to ${path}`);

  try {
    // Uploading the file to OpenAI
    console.log('Starting file upload to OpenAI');
    const fileForRetrieval = await openai.files.create({
      file: createReadStream(path),
      purpose: 'assistants',
    });
    console.log(`File uploaded, ID: ${fileForRetrieval.id}`);

    // Attach file to assistant
    console.log('Attaching file to assistant');

    const myAssistantFile = await openai.beta.assistants.files.create(
      assistantId,
      {
        file_id: fileForRetrieval.id,
      }
    );

    console.log('File attached to assistant');

    // Respond with the file ID
    return NextResponse.json({ success: true, fileId: myAssistantFile });
  } catch (error) {
    // Log and respond to any errors during the upload process
    console.error('Error uploading file:', error);
    return NextResponse.json({
      success: false,
      message: 'Error uploading file',
    });
  }
}
