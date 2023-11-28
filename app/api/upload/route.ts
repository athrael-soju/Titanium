import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file');
  return NextResponse.json({ file: file, success: true });
}
