import { ChatCompletionStream } from "openai/lib/ChatCompletionStream";

export const processStream = (stream: ReadableStream) => {
  if (!(stream instanceof ReadableStream)) {
    console.error("Expected a ReadableStream object, received:", stream);
    return;
  }
  try {
    const runner = ChatCompletionStream.fromReadableStream(stream);
    return runner;
  } catch (error) {
    console.error("Error processing stream:", error);
  }
};
