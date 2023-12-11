import OpenAI, { ClientOptions } from 'openai';
export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

export async function POST(req: Request) {
  try {
    const { userMessage, isActive } = await req.json();
    const openai = new OpenAI(options); // Use your API key here
    if (isActive) {
      return new Response('Assistant is active', { status: 200 });
    } else {
      const completion = openai.beta.chat.completions.stream({
        model: process.env.OPENAI_API_MODEL ?? 'gpt-4-1106-preview',
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
      });

      // Construct and return a new Response object
      return new Response(completion.toReadableStream());
    }
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
