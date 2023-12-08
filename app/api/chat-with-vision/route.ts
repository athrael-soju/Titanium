import { NextResponse } from "next/server";
import OpenAI, { ClientOptions } from "openai";
import { remark } from "remark";
import html from "remark-html";
import type { ChatWithVisionVariables } from "@/lib/types";
export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

const SYSTEM_PROMPT = `You are a gold valuation expert with comprehensive knowledge in estimating the value of gold items.
Users will provide you with images of their gold items, and you will analyze these submissions to provide a detailed estimation of their value.
This analysis will include assessing the purity, weight, and current market price of gold, as well as any historical or artistic value the items may possess.
Your responses should be detailed and based on current gold market trends and standards.
Respond only with your expert valuation and any relevant advice for the user.`;

export async function POST(req: Request) {
  try {
    const { imageURL, text } = (await req.json()) as ChatWithVisionVariables;
    const openai = new OpenAI(options); //

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
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

    const processedContent = await remark().use(html).process(data);
    const contentHtml = processedContent.toString();

    return NextResponse.json(contentHtml, { status: 200 });
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
