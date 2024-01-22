'use client';
import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { FormProvider } from 'react-hook-form';
import MessagesField from '../MessagesField';
import Loader from '../Loader';
import CustomizedInputBase from '../CustomizedInputBase';
import { retrieveRunner } from '@/app/services/chatService';
import { useChatForm } from '@/app/hooks/useChatForm';

const Chat = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const formMethods = useChatForm();
  const { isLoading } = formMethods.watch();
  const sentences = useRef<string[]>([]);
  const sentenceIndex = useRef<number>(0);

  const addUserMessageToState = (message: string) => {
    sentences.current = [];
    sentenceIndex.current = 0;
    const userMessageId = uuidv4();
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `🧑‍💻 ${message}`, sender: 'user', id: userMessageId },
    ]);
  };

  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      formMethods.setValue('isLoading', true);
      addUserMessageToState(message);
      const userEmail = session?.user?.email as string;
      const runner = await retrieveRunner(message, userEmail);
      if (!runner) {
        return;
      }
      runner.on('content', (delta, snapshot) => {
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => msg.id !== 'ai'),
          { text: `🤖 ${snapshot}`, sender: 'ai', id: 'ai' },
        ]);
      });
    } catch (error) {
      console.error(error);
    } finally {
      formMethods.setValue('isLoading', false);
    }
  };

  if (session) {
    return (
      <FormProvider {...formMethods}>
        {isLoading && <Loader />}
        <MessagesField messages={messages} />
        <CustomizedInputBase onSendMessage={sendUserMessage} />
      </FormProvider>
    );
  }
  return <p>Please sign in to access the chat.</p>;
};

export default Chat;
