'use client';
// pages/home.tsx
import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import Chat from './components/Chat/Chat'; // Adjust the path as necessary
import styles from './page.module.css'; // This should contain styles for the AppBar and main container

export default function Home() {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">
            <h1>Titanium.AI</h1>The Super Duper AI Template
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        <Chat /> {/* Here we use the Chat component */}
      </main>
    </>
  );
}
