// components/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import styles from './Header.module.css'; // Adjust the path as necessary

const Header = () => {
  return (
    <AppBar position="fixed" className={styles.gradientAppBar}>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant="h4" style={{ marginRight: '10px' }}>
            Titanium.AI
          </Typography>
          <Typography
            variant="body1"
            style={{ marginTop: '0px', fontSize: 13 }}
          >
            A Super Simple Chat Template
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
