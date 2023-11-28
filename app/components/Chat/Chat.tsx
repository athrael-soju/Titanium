'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from '../FileUpload/FileUpload';
import MessagesField from './MessagesField';
import styles from './Chat.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

const Chat = () => {
  const [assistantName, setAssistantName] = useState('');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [isStartEnabled, setIsStartEnabled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

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

  const checkFields = () => {
    setIsStartEnabled(
      assistantName.trim() !== '' && assistantDescription.trim() !== ''
    );
  };

  const handleStart = () => {
    if (isStartEnabled) {
      setHasStarted(true);
    }
  };

  const renderLandingPage = () => (
    <div className={styles.landingContainer}>
      <TextField
        required
        label="Assistant Name"
        fullWidth
        variant="outlined"
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
        onBlur={checkFields}
        className={styles.textField}
      />
      <TextField
        required
        label="Assistant Description"
        fullWidth
        variant="outlined"
        value={assistantDescription}
        onChange={(e) => setAssistantDescription(e.target.value)}
        onBlur={checkFields}
        className={styles.textField}
        multiline
        rows={4}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={!isStartEnabled}
        onClick={handleStart}
        className={styles.startButton}
      >
        Create Assistant
      </Button>
    </div>
  );

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
    return renderLandingPage();
  }

  return (
    <>
      <MessagesField messages={messages} />
      <div ref={messagesEndRef} />
      <div className={styles.inputArea}>
        <TextField
          fullWidth
          label="🤖 How can I help?"
          variant="outlined"
          onKeyDown={handleSendMessage}
          className={styles.textField}
        />
        <FileUpload />
      </div>
    </>
  );
};

export default Chat;
