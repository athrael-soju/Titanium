import { NextRequest, NextResponse } from 'next/server';
import { writeFile, rm } from 'fs/promises';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;

  if (!file) {
    console.log('No file found in the request');
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  // const path = `/tmp/${file.name}`;
  // await writeFile(path, buffer);
  // await rm(path);

  // console.log(`File written to ${path}`);

  return NextResponse.json({ file: file, success: true });
}
