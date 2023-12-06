import { NextResponse } from "next/server";
import OpenAI, { ClientOptions } from "openai";
export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

// const systemPrompt = `You are an expert tailwind developer. A user will provide you with a
//  low-fidelity wireframe of an application and you will return
//  a single html file that uses tailwind to create the website. Use creative license to make the application more fleshed out.
// if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the html file.`;

const SYSTEM_PROMPT = `You are a comedy writer. A user will upload a image and you will return a funny story.`;

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const openai = new OpenAI(options); // Use your API key here

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      stream: true,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What is in the image?" },
            {
              type: "image_url",
              image_url: {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                detail: "high",
              },
            },
          ],
        },
      ],
    });

    // console.log(response);
    return new Response(completion.toReadableStream());
    // return NextResponse.json(response);
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
