// FilePaper.js
import React from 'react';
import { List, Paper, Typography, Box } from '@mui/material';

interface FilePaperProps {
  files: any[];
  renderFileItem: (file: any) => React.ReactNode;
}

const FileList: React.FC<FilePaperProps> = ({ files, renderFileItem }) => (
  <Paper variant="outlined" sx={{ padding: 2, marginBottom: 2 }}>
    <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
      Attached Files
    </Typography>
    <Box sx={{ height: '160px', overflowY: 'auto' }}>
      <List dense>{files.map((file) => renderFileItem(file))}</List>
    </Box>
  </Paper>
);

export default FileList;
