'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { FormProvider } from 'react-hook-form';
import { useChatForm } from '@/app/hooks/useChatForm';

import ResponsiveAppBar from './components/AppBar';
import Chat from './components/Chat';
import styles from './page.module.css';

export default function Home() {
  const formMethods = useChatForm();

  return (
    <SessionProvider>
      <ResponsiveAppBar />
      <main className={styles.main}>
        <FormProvider {...formMethods}>
          <Chat />
        </FormProvider>
      </main>
    </SessionProvider>
  );
}
