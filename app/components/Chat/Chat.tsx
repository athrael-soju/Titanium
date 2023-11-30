// Chat.tsx
import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import MessagesField from './MessagesField';
import FileUpload from '../FileUpload/FileUpload';
import AssistantCreationForm from '../Assistant/AssistantCreationForm';
import Loader from './Loader';
import styles from './Chat.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

const Chat: React.FC = () => {
  const [assistantName, setAssistantName] = useState<string>('');
  const [assistantDescription, setAssistantDescription] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [isStartEnabled, setIsStartEnabled] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsStartEnabled(
      assistantName.trim() !== '' && assistantDescription.trim() !== ''
    );
  }, [assistantName, assistantDescription]);

  const handleStart = async () => {
    if (isStartEnabled) {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/createAssistant', {
          assistantName,
          assistantDescription,
        });
        if (response.status === 200) {
          setHasStarted(true);
          setAssistantId(response.data.assistantId);
        }
      } catch (error) {
        console.error('Error creating assistant:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.body?.getReader();
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

  const handleSendMessage = async (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const userMessage = target.value.trim();
      if (userMessage) {
        addUserMessageToState(userMessage);
        target.value = '';
        const aiResponseId = uuidv4();
        const reader = await handleAIResponse(userMessage);
        await processAIResponseStream(reader, aiResponseId);
      }
    }
  };
  if (!hasStarted) {
    return isLoading ? (
      <Loader />
    ) : (
      <AssistantCreationForm
        onAssistantCreate={handleStart}
        isStartEnabled={isStartEnabled}
        assistantName={assistantName}
        setAssistantName={setAssistantName}
        assistantDescription={assistantDescription}
        setAssistantDescription={setAssistantDescription}
      />
    );
  }
  return (
    <>
      {isLoading && <Loader />}
      <MessagesField messages={messages} />
      <div className={styles.inputArea}>
        <TextField
          fullWidth
          label="🤖 How can I help?"
          variant="outlined"
          onKeyDown={handleSendMessage}
          className={styles.textField}
        />
        <FileUpload
          assistantId={assistantId}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </>
  );
};

export default Chat;
