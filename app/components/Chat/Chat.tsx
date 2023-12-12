'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessagesField from './MessagesField';
import styles from './Chat.module.css';
import Loader from './Loader';
import { useSession } from 'next-auth/react';
import CustomizedInputBase from './CustomizedInputBase';
interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

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

  const handleAIResponse = async (userMessage: string) => {
    const userEmail = session?.user?.email as string;
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, userEmail }),
      });
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      if (isAssistantEnabled) {
        return response;
      } else {
        return response.body?.getReader();
      }
    } catch (error) {
      console.error('Failed to fetch AI response:', error);
    }
  };

  const processAIResponseStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
    aiResponseId: string
  ) => {
    if (!reader) {
      console.error(
        'No reader available for processing the AI response stream.'
      );
      return;
    }

    const decoder = new TextDecoder();
    let aiResponseText = '';

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

      const chunk = value ? decoder.decode(value, { stream: true }) : '';
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

      addAiMessageToState(aiResponseText, aiResponseId);

      return reader.read().then(processText);
    };
    await reader.read().then(processText);
  };

  const sendUserMessage = async (message: string) => {
    if (message.trim()) {
      addUserMessageToState(message);
      const aiResponseId = uuidv4();
      const response = await handleAIResponse(message);

      if (response) {
        if (isAssistantEnabled) {
          // Check if response is of type Response
          if (response instanceof Response) {
            const contentType = response.headers.get('Content-Type');

            if (contentType?.includes('application/json')) {
              try {
                const data = await response.json();
                addAiMessageToState(data, aiResponseId);
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            } else {
              try {
                const textResponse = await response.text();
                addAiMessageToState(textResponse, aiResponseId);
              } catch (error) {
                console.error('Error reading text response:', error);
              }
            }
          }
        }
        // Check if response is of type ReadableStreamDefaultReader<Uint8Array>
        else if (response instanceof ReadableStreamDefaultReader) {
          await processAIResponseStream(response, aiResponseId);
        } else {
          console.error('Unexpected response type:', response);
        }
      }
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
            onSendMessage={sendUserMessage}
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
