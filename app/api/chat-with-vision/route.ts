import { NextResponse } from "next/server";
import OpenAI, { ClientOptions } from "openai";
export const runtime = "edge";
import type { ChatWithVisionVariables } from "@/lib/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

export async function POST(req: Request) {
  try {
    const { imageURL, text } = (await req.json()) as ChatWithVisionVariables;
    const openai = new OpenAI(options); // Use your API key here

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text },
            {
              type: "image_url",
              image_url: {
                detail: "high",
                url: imageURL,
              },
            },
          ],
        },
      ],
    });

    const data = completion?.choices?.[0]?.message?.content;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
