import OpenAI from "openai";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios from "axios";
import type { ChatWithVisionVariables } from "@/lib/types";

type Completions = OpenAI.Beta.Chat.Completions;

const mutationFn = async (
  args: ChatWithVisionVariables
): Promise<Completions> => {
  const { data } = await axios.post<Completions>("/api/chat-with-vision", args);
  return data;
};

export const useChatWithVision = (): UseMutationResult<
  Completions,
  unknown,
  ChatWithVisionVariables,
  unknown
> => {
  return useMutation<Completions, unknown, ChatWithVisionVariables, unknown>({
    mutationFn,
  });
};
