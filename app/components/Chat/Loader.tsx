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
      zIndex={9999}
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;
