'use client';
import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { FormProvider } from 'react-hook-form';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import MessagesField from '../MessagesField';
import styles from './index.module.css';
import Loader from '../Loader';
import CustomizedInputBase from '../CustomizedInputBase';
import {
  retrieveAIResponse,
  retrieveTextFromSpeech,
} from '@/app/services/chatService';
import { useChatForm } from '@/app/hooks/useChatForm';

const nlp = winkNLP(model);

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const formMethods = useChatForm();
  const {
    isAssistantEnabled,
    isVisionEnabled,
    isTextToSpeechEnabled,
    isLoading,
  } = formMethods.watch();
  const { model, voice } = formMethods.getValues();
  const sentences = useRef<string[]>([]);
  const sentenceIndex = useRef<number>(0);

  const addUserMessageToState = (message: string) => {
    sentences.current = [];
    sentenceIndex.current = 0;
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
        await processBuffer(buffer, aiResponseId, aiResponseText);
        return true;
      }
      buffer += value ? decoder.decode(value, { stream: true }) : '';
      await processBuffer(buffer, aiResponseId, aiResponseText);
      return false;
    };

    let isDone = false;
    while (!isDone) {
      isDone = await processChunk();
    }
    if (isTextToSpeechEnabled) {
      await retrieveTextFromSpeech(
        sentences.current[sentences.current.length - 1],
        model,
        voice
      );
    }
  };

  const processBuffer = async (
    buffer: string,
    aiResponseId: string,
    aiResponseText: string
  ) => {
    let boundary = buffer.lastIndexOf('\n');
    if (boundary === -1) return;

    let completeData = buffer.substring(0, boundary);
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

    const doc = nlp.readDoc(aiResponseText);
    sentences.current = doc.sentences().out();
    addAiMessageToState(aiResponseText, aiResponseId);
    if (isTextToSpeechEnabled) {
      if (sentences.current.length > sentenceIndex.current + 1) {
        await retrieveTextFromSpeech(
          sentences.current[sentenceIndex.current++],
          model,
          voice
        );
      }
    }
  };

  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      formMethods.setValue('isLoading', true);
      addUserMessageToState(message);
      const aiResponseId = uuidv4();
      const userEmail = session?.user?.email as string;
      const response = await retrieveAIResponse(
        message,
        userEmail,
        isAssistantEnabled,
        isVisionEnabled
      );

      if (!response) {
        return;
      }
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
      formMethods.setValue('isLoading', false);
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
      if (isTextToSpeechEnabled) {
        await retrieveTextFromSpeech(data, model, voice);
      }
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
          <CustomizedInputBase onSendMessage={sendUserMessage} />
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
