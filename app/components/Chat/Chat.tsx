'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessagesField from './MessagesField';
import styles from './Chat.module.css';
import Loader from './Loader';
import { useSession } from 'next-auth/react';
import CustomizedInputBase from './CustomizedInputBase';
import OpenAI, { ClientOptions } from 'openai';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const options: ClientOptions = { apiKey: process.env.OPENAI_API_KEY };
const openai = new OpenAI(options);
const Chat = () => {
  const { data: session } = useSession();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantEnabled, setIsAssistantEnabled] = useState<boolean>(false);

  const addUserMessageToState = (message: string) => {
    const userMessageId = uuidv4();
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `🧑‍💻 ${message}`, sender: 'user', id: userMessageId },
    ]);
  };

  const addAiMessageToState = (
    aiResponseText: string,
    aiResponseId: string
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages.filter((msg) => msg.id !== aiResponseId),
      { text: `🤖 ${aiResponseText}`, sender: 'ai', id: aiResponseId },
    ]);
  };

  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return;
    try {
      setIsLoading(true);
      addUserMessageToState(message);
      const aiResponseId = uuidv4();

      const completion = openai.beta.chat.completions.stream({
        model: process.env.OPENAI_API_MODEL ?? 'gpt-4-1106-preview',
        messages: [{ role: 'user', content: message }],
        stream: true,
      });

      let response = completion.toReadableStream().getReader();
      if (!response) return;

      try {
        if (!response) {
          console.error(
            'No reader available for processing the AI response stream.'
          );
          return;
        }

        const decoder = new TextDecoder();
        let aiResponseText = '';

        response?.read().then(function processText({ done, value }) {
          if (done) {
            return;
          }

          // Decode the stream chunk and parse each line as JSON
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          lines.forEach((line) => {
            if (line) {
              try {
                const json = JSON.parse(line);
                if (json?.choices[0].delta.content) {
                  aiResponseText += json.choices[0].delta.content;
                }
              } catch (error) {
                console.error('Failed to parse JSON:', line, error);
              }
            }
          });

          // Update the messages state with the latest AI response text
          addAiMessageToState(aiResponseText, aiResponseId);

          // Read the next chunk
          response.read().then(processText);
        });
      } catch (error) {
        console.error('Error processing stream:', error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (session) {
    return (
      <>
        {isLoading && <Loader />}
        <MessagesField messages={messages} />
        <div className={styles.inputArea}>
          <CustomizedInputBase
            setIsLoading={setIsLoading}
            onSendMessage={() => sendUserMessage('')}
            isAssistantEnabled={isAssistantEnabled}
            setIsAssistantEnabled={setIsAssistantEnabled}
          />
        </div>
      </>
    );
  }
  return (
    <div className={styles.loginPrompt}>
      <p>Please sign in to access the chat.</p>
    </div>
  );
};
export default Chat;
