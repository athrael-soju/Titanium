import OpenAI, { ClientOptions } from 'openai';
export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json();
    const openai = new OpenAI(options); // Use your API key here

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL ?? 'gpt-4-1106-preview',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: userMessage },
      ],
      stream: true,
    });

    let aiResponse = '';
    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        aiResponse += chunk.choices[0].delta.content;
      }
    }

    // Construct and return a new Response object
    return new Response(JSON.stringify({ aiResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // Return an error response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
