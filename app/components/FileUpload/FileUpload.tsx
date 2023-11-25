'use client';

import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let files = event?.target?.files!;
    if (files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log('File uploaded successfully');
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  return (
    <>
      <input
        accept="image/*" // or any other file types you want to accept
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
          onClick={handleFileUpload}
        >
          <CloudUploadIcon />
        </IconButton>
      </label>
    </>
  );
};

export default FileUpload;
