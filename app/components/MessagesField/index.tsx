import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import styles from './index.module.css';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

interface MessagesFieldProps {
  messages: IMessage[];
}

const CodeBlock: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => {
  const match = /language-(\w+)/.exec(className ?? '');
  return match ? (
    <SyntaxHighlighter language={match[1]} PreTag="div">
      {String(children)}
    </SyntaxHighlighter>
  ) : (
    <code className={className}>{children}</code>
  );
};

const MessagesField: React.FC<MessagesFieldProps> = ({ messages }) => {
  useEffect(() => {
    const container = document.querySelector(`.${styles.messagesContainer}`);
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.sender === 'user' ? styles.userMessage : styles.aiMessage
          }
        >
          {/* @ts-ignore ReactMarkdown doesn't have types */}
          <ReactMarkdown components={{ code: CodeBlock }}>
            {message.text}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

export default MessagesField;
