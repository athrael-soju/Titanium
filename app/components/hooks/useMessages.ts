import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}

const useMessages = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const addUserMessage = (text: string) => {
    const id = uuidv4();
    setMessages([...messages, { text: `🧑‍💻 ${text}`, sender: 'user', id }]);
  };

  const addAiMessage = (text: string, id: string) => {
    setMessages((prevMessages) => [
      ...prevMessages.filter((message) => message.id !== id),
      { text: `🤖 ${text}`, sender: 'ai', id },
    ]);
  };

  return { messages, addUserMessage, addAiMessage };
};

export default useMessages;
