// Chat.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { TextField } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import MessagesField from './MessagesField';
import FileUpload from '../FileUpload/FileUpload';
import AssistantCreationForm from '../Assistant/AssistantCreationForm';
import Loader from './Loader';
import useMessages from '../hooks/useMessages'; // Custom hook for managing messages
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { messages, addUserMessage, addAiMessage } = useMessages();

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

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        const userMessage = target.value.trim();
        if (userMessage) {
          addUserMessage(userMessage);
          target.value = '';
          const reader = await handleAIResponse(userMessage);
          if (reader) {
            let aiResponseText = '';
            const processText = async ({
              done,
              value,
            }: {
              done: boolean;
              value?: Uint8Array;
            }): Promise<void> => {
              if (done) {
                addAiMessage(aiResponseText, uuidv4());
                return;
              }
              const chunk = value
                ? new TextDecoder().decode(value, { stream: true })
                : '';
              aiResponseText += chunk;
              return reader.read().then(processText);
            };
            await reader.read().then(processText);
          }
        }
      }
    },
    [addUserMessage, addAiMessage]
  );

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
