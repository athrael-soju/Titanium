'use client';
// pages/home.tsx
import React from 'react';
import Header from './components/Header/Header'; // Adjust the path as necessary
import Chat from './components/Chat/Chat'; // Adjust the path as necessary
import styles from './page.module.css'; // This should contain styles for the main container

export default function Home() {
  return (
    <>
      <Header /> {/* Header component */}
      <main className={styles.main}>
        <Chat /> {/* Streaming Chat component */}
      </main>
    </>
  );
}
