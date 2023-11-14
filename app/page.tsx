'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, TextField } from '@mui/material';
import styles from './page.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
}

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const userMessage = target.value;
      target.value = ''; // Clear the input field
      if (userMessage.trim()) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: userMessage, sender: 'user' },
        ]);
        // Mock AI response
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: `AI Response to: "${userMessage}"`, sender: 'ai' },
          ]);
        }, 500);
      }
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">Chat Application</Typography>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        {/* Main window for conversation */}
        <div className={styles.chatWindow}>
          {messages.map((message, index) => (
            <div
              key={index}
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
