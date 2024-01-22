'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

import ResponsiveAppBar from './components/AppBar';
import Chat from './components/Chat';
import ChatWithRunner from './components/ChatWithRunner';
import styles from './page.module.css';

export default function Home() {
  return (
    <SessionProvider>
      <ResponsiveAppBar />
      <main className={styles.main}>
        <ChatWithRunner />
      </main>
    </SessionProvider>
  );
}
