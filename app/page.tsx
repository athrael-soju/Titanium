'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, TextField } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import styles from './page.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const userMessage = target.value;
      if (userMessage.trim()) {
        const userMessageId = uuidv4();
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `🧑‍💻 ${userMessage}`, sender: 'user', id: userMessageId },
        ]);

        target.value = ''; // Clear the input field

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const reader = response?.body?.getReader();
          const decoder = new TextDecoder();

          let aiResponseId = uuidv4();
          let aiResponseText = '';

          reader?.read().then(function processText({ done, value }) {
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
            setMessages((prevMessages) => [
              ...prevMessages.filter((msg) => msg.id !== aiResponseId),
              { text: `🤖 ${aiResponseText}`, sender: 'ai', id: aiResponseId },
            ]);

            // Read the next chunk
            reader.read().then(processText);
          });
        } catch (error) {
          console.error('Failed to fetch AI response:', error);
        }
      }
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">
            Titanium.AI - Super Duper Template
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        {/* Main window for conversation */}
        <div className={styles.chatWindow}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.sender === 'user'
                  ? styles.userMessage
                  : styles.aiMessage
              }
            >
              {message.text}
            </div>
          ))}
          {/* Invisible element to auto-scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box at the bottom */}
        <div className={styles.inputBox}>
          <TextField
            fullWidth
            label="Type your message"
            variant="outlined"
            onKeyDown={handleSendMessage}
          />
        </div>
      </main>
    </>
  );
}
