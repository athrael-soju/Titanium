"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import type { ChatWithVisionVariables } from "@/lib/types";
import MessagesField from "./MessagesField";
import styles from "./Chat.module.css";
import Loader from "./Loader";
import CustomizedInputBase from "./CustomizedInputBase";
interface IMessage {
  text: string;
  sender: "user" | "ai";
  id: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addUserMessageToState = (message: any) => {
    const userMessageId = uuidv4();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: `🧑‍💻 ${message?.text}`,
        sender: "user",
        id: userMessageId,
        imageURL: message?.imageURL,
      },
    ]);
  };

  const addAiMessageToState = (
    aiResponseText: string,
    aiResponseId: string
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages.filter((msg) => msg.id !== aiResponseId),
      { text: aiResponseText, sender: "ai", id: aiResponseId },
    ]);
  };

  const handleAIResponse = async (userMessage: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      });
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.body?.getReader();
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
    }
  };

  const processAIResponseStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
    aiResponseId: string
  ) => {
    if (!reader) {
      console.error(
        "No reader available for processing the AI response stream."
      );
      return;
    }

    const decoder = new TextDecoder();
    let aiResponseText = "";

    const processText = async ({
      done,
      value,
    }: {
      done: boolean;
      value?: Uint8Array;
    }): Promise<void> => {
      if (done) {
        return;
      }

      const chunk = value ? decoder.decode(value, { stream: true }) : "";
      const lines = chunk.split("\n");

      lines.forEach((line) => {
        if (line) {
          try {
            const json = JSON.parse(line);
            if (json?.choices[0].delta.content) {
              aiResponseText += json.choices[0].delta.content;
            }
          } catch (error) {
            console.error("Failed to parse JSON:", line, error);
          }
        }
      });

      addAiMessageToState(aiResponseText, aiResponseId);

      return reader.read().then(processText);
    };
    await reader.read().then(processText);
  };

  const sendUserMessage = async (
    message: string | ChatWithVisionVariables | any
  ) => {
    const aiResponseId = uuidv4();

    const systemRole: OpenAI.ChatCompletionRole = "system";
    if (message?.role === systemRole) {
      addAiMessageToState(message?.text, aiResponseId);
      return;
    }

    if (message?.hasOwnProperty("imageURL")) {
      addUserMessageToState(message as any);
      return;
    }
    if (typeof message === "string" && message?.trim()) {
      addUserMessageToState(message);
      const reader = await handleAIResponse(message);
      if (reader) {
        await processAIResponseStream(reader, aiResponseId);
      }
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <MessagesField messages={messages} />
      <div className={styles.inputArea}>
        <CustomizedInputBase
          setIsLoading={setIsLoading}
          onSendMessage={sendUserMessage}
        />
      </div>
    </>
  );
};

export default Chat;
