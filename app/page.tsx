'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

import ResponsiveAppBar from './components/Header/ResponsiveAppBar'; // Adjust the path as necessary
import Chat from './components/Chat/Chat'; // Adjust the path as necessary
import styles from './page.module.css'; // This should contain styles for the main container

export default function Home() {
  return (
    <SessionProvider>
      <ResponsiveAppBar />
      <main className={styles.main}>
        <Chat /> {/* Streaming Chat component */}
      </main>
    </SessionProvider>
  );
}
