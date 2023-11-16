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
      target.value = ''; // Clear the input field
      if (userMessage.trim()) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: userMessage, sender: 'user', id: uuidv4() },
        ]);
        // Make an API call to the server to get the AI response
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage: userMessage }),
          });

          const { aiResponse } = await response.json();
          console.log('aiResponse', aiResponse);

          setMessages((prevMessages) => [
            ...prevMessages,
            { text: aiResponse, sender: 'ai', id: uuidv4() },
          ]);
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
          <Typography variant="h6">Chat Application</Typography>
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
