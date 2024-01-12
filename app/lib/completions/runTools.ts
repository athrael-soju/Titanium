import OpenAI, { ClientOptions } from "openai";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction";
import { ChatCompletionStreamingRunner } from "openai/lib/ChatCompletionStreamingRunner";
import { JSONSchema } from "openai/lib/jsonschema";
import { ZodSchema, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const options: ClientOptions = {
  apiKey: OPENAI_API_KEY,
};

const GetParams = z.object({
  ticker: z.string(),
});

type GetParams = z.infer<typeof GetParams>;

async function getEMA({ ticker }: GetParams) {
  const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
  const URL = `https://www.alphavantage.co/query?function=EMA&symbol=${ticker}&interval=daily&time_period=200&series_type=open&apikey=${ALPHA_VANTAGE_KEY}`;
  const response = await fetch(URL);
  const data = await response.json();
  return data["Technical Analysis: EMA"];
}

async function getRSI({ ticker }: GetParams) {
  const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
  const URL = `https://www.alphavantage.co/query?function=RSI&symbol=${ticker}&interval=weekly&time_period=10&series_type=open&apikey=${ALPHA_VANTAGE_KEY}`;
  const response = await fetch(URL);
  const data = await response.json();
  return data["Technical Analysis: RSI"];
}

function zodFunction<T extends object>({
  function: fn,
  schema,
  description = "",
  name,
}: {
  function: (args: T) => Promise<object>;
  schema: ZodSchema<T>;
  description?: string;
  name?: string;
}): RunnableToolFunctionWithParse<T> {
  return {
    type: "function",
    function: {
      function: fn,
      name: name ?? fn.name,
      description: description,
      parameters: zodToJsonSchema(schema) as JSONSchema,
      parse(input: string): T {
        const obj = JSON.parse(input);
        return schema.parse(obj);
      },
    },
  };
}

export async function runTools({
  ticker,
}: {
  ticker: string;
}): Promise<ChatCompletionStreamingRunner> {
  const openai = new OpenAI(options);
  const stream = await openai.beta.chat.completions
    .runTools({
      stream: true,
      max_tokens: 100,
      model: "gpt-4-1106-preview",
      tools: [
        zodFunction({
          function: getEMA,
          schema: GetParams,
          description:
            "Get the EMA (Exponential Moving Average) for a given ticker",
        }),
        zodFunction({
          function: getRSI,
          schema: GetParams,
          description:
            "Get the RSI (Relative Strength Index) for a given ticker",
        }),
      ],
      messages: [
        {
          role: "system",
          content:
            "Please use the following commands to get the EMA and RSI for a given ticker",
        },
        {
          role: "user",
          content: `Shouuld I sell, hold or buy ${ticker} based on the EMA and RSI?`,
        },
      ],
    })
    .on("message", (msg) => console.log("msg", msg))
    .on("functionCall", (functionCall) =>
      console.log("functionCall", functionCall)
    )
    .on("functionCallResult", (functionCallResult) =>
      console.log("functionCallResult", functionCallResult)
    )
    .on("content", (diff) => process.stdout.write(diff));

  const result = await stream.finalChatCompletion();
  console.log();
  console.log("messages");
  console.log(stream.messages);

  console.log();
  console.log("final chat completion");
  console.dir(result, { depth: null });

  return stream;
}
