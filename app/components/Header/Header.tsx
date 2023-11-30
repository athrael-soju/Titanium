import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant="h4" style={{ marginRight: '10px' }}>
            Titanium
          </Typography>
          <Typography
            variant="body1"
            style={{ marginTop: '0px', fontSize: 13 }}
          >
            The Super Simple Chat Template
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
