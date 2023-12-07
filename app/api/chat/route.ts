import OpenAI, { ClientOptions } from "openai";
export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json();
    const openai = new OpenAI(options); // Use your API key here

    const completion = openai.beta.chat.completions.stream({
      model: "gpt-4-vision-preview",
      stream: true,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What’s in this image?" },
            {
              type: "image_url",
              image_url: {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              },
            },
          ],
        },
      ],
    });

    // Construct and return a new Response object
    return new Response(completion.toReadableStream());
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
