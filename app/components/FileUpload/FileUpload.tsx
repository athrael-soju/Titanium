'use client';

import React, { useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let files = event.target.files;
    if (files?.[0]) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('File uploaded successfully', response);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        accept="application/pdf" // or any other file types you want to accept
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
        ref={fileInputRef}
      />
      <label htmlFor="file-upload">
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
        >
          <CloudUploadIcon fontSize="large" />
        </IconButton>
      </label>
    </>
  );
};

export default FileUpload;
