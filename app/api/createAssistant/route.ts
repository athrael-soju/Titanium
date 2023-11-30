import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
/*

  This route creates a new assistant using the OpenAI API

  The request body should be a JSON object with the following parameters:

  - assistantName: The name of the assistant
  - assistantDescription: A description of the assistant

  The response will be a JSON object with the following parameters:

  - message: A message indicating whether the assistant was created successfully
  - assistantId: The ID of the assistant that was created

  If an error occurs, the response will be a JSON object with the following parameters:

  - error: A message indicating the error that occurred
*/
export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const { assistantName, assistantDescription } = await req.json();

      // Validate the assistant parameters
      if (!assistantName || !assistantDescription) {
        throw new Error('Missing required assistant parameters');
      }

      // Create the assistant options
      const assistantOptions: any = {
        name: assistantName,
        instructions: assistantDescription,
        model: process.env.OPENAI_API_MODEL,
        tools: [{ type: 'retrieval' }, { type: 'code_interpreter' }],
      };

      console.log('Assistant Options:', assistantOptions);

      // Create the assistant
      const assistant = await openai.beta.assistants.create(assistantOptions);

      // Create the assistant thread
      const thread = await openai.beta.threads.create();

      const threadId = thread.id;
      console.log('Thread ID:', threadId);

      return NextResponse.json({
        message: 'Assistant created successfully',
        assistantId: assistant.id,
        threadId,
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
