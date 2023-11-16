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
            Titanium.AI - Super Duper Template
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        <Chat /> {/* Here we use the Chat component */}
      </main>
    </>
  );
}
