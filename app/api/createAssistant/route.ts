import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const { assistantName, assistantDescription } = await req.json();

      if (!assistantName || !assistantDescription) {
        throw new Error('Missing required assistant parameters');
      }

      const assistantOptions: any = {
        name: assistantName,
        instructions: assistantDescription,
        model: process.env.OPENAI_API_MODEL,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
      };

      console.log('Assistant Options:', assistantOptions);

      const assistant = await openai.beta.assistants.create(assistantOptions);

      return NextResponse.json({
        message: 'Assistant created successfully',
        assistantId: assistant.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message });
      } else {
        console.error('Unknown error:', error);
        return NextResponse.json({ error: 'An unknown error occurred' });
      }
    }
  } else {
    return NextResponse.json({ error: 'Method Not Allowed' });
  }
}
