'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import MessagesField from '../MessagesField';
import styles from './index.module.css';
import Loader from '../Loader';
import CustomizedInputBase from '../CustomizedInputBase';
import { useBufferProcessing } from '@/app/hooks';

const Chat = () => {
  const { data: session } = useSession();
  const { watch } = useFormContext();
  const isLoading = watch('isLoading');
  const { messages, sendUserMessage } = useBufferProcessing(session);

  if (session) {
    return (
      <>
        {isLoading && <Loader />}
        <MessagesField messages={messages} />
        <div className={styles.inputArea}>
          <CustomizedInputBase onSendMessage={sendUserMessage} />
        </div>
      </>
    );
  }
  return (
    <div className={styles.loginPrompt}>
      <p>Please sign in to access the chat.</p>
    </div>
  );
};
export default Chat;
