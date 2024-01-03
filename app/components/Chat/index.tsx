'use client';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { useForm, FormProvider } from 'react-hook-form';
import MessagesField from '../MessagesField';
import styles from './index.module.css';
import Loader from '../Loader';
import CustomizedInputBase from '../CustomizedInputBase';
import { retrieveAIResponse } from '@/app/services/chatService';

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formMethods = useForm({
    defaultValues: {
      isAssistantEnabled: false,
      isVisionEnabled: false,
    },
  });

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
    let buffer = '';
    let aiResponseText = '';

    const processChunk = async () => {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining data in buffer
        processBuffer(buffer, aiResponseId, aiResponseText);
        return true; // Indicates the stream has ended
      }
      buffer += value ? decoder.decode(value, { stream: true }) : '';
      processBuffer(buffer, aiResponseId, aiResponseText);
      return false; // Indicates more data might be available
    };

    let isDone = false;
    while (!isDone) {
      isDone = await processChunk();
    }
  };

  const processBuffer = (
    buffer: string,
    aiResponseId: string,
    aiResponseText: string
  ) => {
    let boundary = buffer.lastIndexOf('\n');
    if (boundary === -1) return;

    let completeData = buffer.substring(0, boundary);
    buffer = buffer.substring(boundary + 1); // Keep incomplete part in buffer

    completeData.split('\n').forEach((line) => {
      if (line) {
        try {
          const json = JSON.parse(line);
          if (json?.choices[0]?.delta?.content) {
            aiResponseText += json.choices[0].delta.content;
          }
        } catch (error) {
          console.error('Failed to parse JSON:', line, error);
        }
      }
    });
    addAiMessageToState(aiResponseText, aiResponseId);
  };

  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return;
    try {
      setIsLoading(true);
      addUserMessageToState(message);
      const aiResponseId = uuidv4();
      const userEmail = session?.user?.email as string;

      // Retrieve values from the form's state
      const formState = formMethods.getValues();
      const { isAssistantEnabled, isVisionEnabled } = formState;

      const response = await retrieveAIResponse(
        message,
        userEmail,
        isAssistantEnabled,
        isVisionEnabled
      );

      if (!response) return;

      // Process the response based on the form's state
      if (isAssistantEnabled) {
        await processResponse(response, aiResponseId);
      } else if (isVisionEnabled) {
        await processStream(response, aiResponseId);
      } else {
        await processStream(response, aiResponseId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  async function processResponse(
    response: ReadableStreamDefaultReader<Uint8Array> | Response,
    aiResponseId: string
  ) {
    if (!(response instanceof Response)) {
      console.error('Expected a Response object, received:', response);
      return;
    }
    try {
      const contentType = response.headers.get('Content-Type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();
      addAiMessageToState(data, aiResponseId);
    } catch (error) {
      console.error('Error processing response:', error);
    }
  }
  async function processStream(
    stream: ReadableStreamDefaultReader<Uint8Array> | Response,
    aiResponseId: string
  ) {
    if (!(stream instanceof ReadableStreamDefaultReader)) {
      console.error(
        'Expected a ReadableStreamDefaultReader object, received:',
        stream
      );
      return;
    }
    try {
      await processAIResponseStream(stream, aiResponseId);
    } catch (error) {
      console.error('Error processing stream:', error);
    }
  }
  if (session) {
    return (
      <FormProvider {...formMethods}>
        {isLoading && <Loader />}
        <MessagesField messages={messages} />
        <div className={styles.inputArea}>
          <CustomizedInputBase
            setIsLoading={setIsLoading}
            onSendMessage={sendUserMessage}
          />
        </div>
      </FormProvider>
    );
  }
  return (
    <div className={styles.loginPrompt}>
      <p>Please sign in to access the chat.</p>
    </div>
  );
};
export default Chat;
