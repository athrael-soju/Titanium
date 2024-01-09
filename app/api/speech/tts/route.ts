import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { ClientOptions } from 'openai';

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);

export async function POST(req: NextRequest) {
  try {
    const { text, model, voice } = await req.json();
    const response = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buffer);
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { message: 'Error generating speech', error: error },
      { status: 500 }
    );
  }
}
