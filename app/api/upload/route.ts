import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as unknown as File;

  if (!file) {
    console.log('No file found in the request');
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({ file: file, success: true });
}
