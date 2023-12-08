import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { ChatWithVisionVariables } from "@/lib/types";
import styles from "./MessagesField.module.css";

interface Message {
  text: string;
  sender: "user" | "ai";
  id: string;
}

interface MessagesFieldProps {
  messages: Message[];
}

const CodeBlock: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => {
  const match = /language-(\w+)/.exec(className || "");
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

  const getMessage = (message: Message | any) => {
    if (message?.imageURL) {
      return (
        <div className={styles.imageContainer}>
          <div dangerouslySetInnerHTML={{ __html: message.text }} />
          <img
            src={message?.imageURL}
            alt="Uploaded"
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
              objectFit: "contain",
              marginTop: "20px",
            }}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          paddingLeft: "30px",
        }}
        dangerouslySetInnerHTML={{ __html: message.text }}
      />
    );
  };

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.sender === "user" ? styles.userMessage : styles.aiMessage
          }
        >
          {getMessage(message)}
        </div>
      ))}
    </div>
  );
};

export default MessagesField;
