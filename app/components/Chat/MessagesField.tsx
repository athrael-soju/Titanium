import React from 'react';
import styles from './MessagesField.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

interface MessagesFieldProps {
  messages: IMessage[];
}

const MessagesField: React.FC<MessagesFieldProps> = ({ messages }) => {
  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.sender === 'user' ? styles.userMessage : styles.aiMessage
          }
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessagesField;
