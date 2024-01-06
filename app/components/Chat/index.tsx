'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { FormProvider } from 'react-hook-form';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

import MessagesField from '../MessagesField';
import styles from './index.module.css';
import Loader from '../Loader';
import CustomizedInputBase from '../CustomizedInputBase';
import { retrieveAIResponse } from '@/app/services/chatService';
import { useChatForm } from '@/app/hooks/useChatForm';

const nlp = winkNLP(model);

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<IMessage[]>([]);

  const sentences = useRef<string[]>([]);
  const speechIndex = useRef<number>(0);
  const audioQueue = useRef<string[]>([]);
  const audioPlaying = useRef(false);

  const processNextAudioItem = useCallback(async () => {
    if (audioQueue.current.length > 0 && !audioPlaying.current) {
      const textToSpeak = audioQueue.current.shift()!;
      audioPlaying.current = true;
      try {
        const response = await fetch('/api/speech/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak }),
        });
        if (!response.ok) {
          throw new Error('Failed to convert text to speech');
        }
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
          audioPlaying.current = false;
          processNextAudioItem();
        };
      } catch (error) {
        console.error('TTS playback error:', error);
        audioPlaying.current = false;
        processNextAudioItem();
      }
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      audioQueue.current.push(text);
      if (!audioPlaying.current) {
        processNextAudioItem();
      }
    },
    [processNextAudioItem]
  );

  const formMethods = useChatForm();
  const { isAssistantEnabled, isVisionEnabled, isLoading } =
    formMethods.watch();

  const addUserMessageToState = (message: string) => {
    sentences.current = [];
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
        processBuffer(buffer, aiResponseId, aiResponseText);
        return true;
      }
      buffer += value ? decoder.decode(value, { stream: true }) : '';
      processBuffer(buffer, aiResponseId, aiResponseText);
      return false;
    };

    let isDone = false;
    while (!isDone) {
      isDone = await processChunk();
    }
  };

  useEffect(() => {
    if (sentences.current.length > 0 && speechIndex.current !== 0) {
      speak(sentences.current[speechIndex.current]);

      speechIndex.current = 0;
      sentences.current = [];
    }
  }, [isLoading, speak]);

  useEffect(() => {
    if (sentences.current.length > 1) {
      speak(sentences.current[speechIndex.current]);
      speechIndex.current++;
    }
  }, [sentences.current.length, speak]);

  const processBuffer = (
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

            const doc = nlp.readDoc(aiResponseText);
            sentences.current = doc.sentences().out();
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
