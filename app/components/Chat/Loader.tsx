import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loader: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="80vh"
      position="fixed"
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;
