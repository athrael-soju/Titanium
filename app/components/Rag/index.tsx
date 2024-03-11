import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Switch,
  Typography,
  Box,
  DialogContent,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';

import { retrieveServices } from '@/app/services/commonService';
import {
  updateRag,
  uploadRagFile,
  deleteRagFile,
  updateFileStatus,
} from '@/app/services/ragService';
import RagFileList from './RagFileList';
import RagForm from './RagForm';
import { parseDocument } from '@/app/services/unstructuredService';
import { embedConversation } from '@/app/services/embeddingService';
import {
  upsertToVectorDb,
  deleteFileFromVectorDb,
} from '@/app/services/vectorDbService';

interface RagDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleRag?: (isRagEnabled: boolean) => void;
}

const RagDialog: React.FC<RagDialogProps> = ({
  open,
  onClose,
  onToggleRag,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState<{
    topK: boolean;
    chunkSize: boolean;
    chunkBatch: boolean;
    parsingStrategy: boolean;
  }>({
    topK: false,
    chunkSize: false,
    chunkBatch: false,
    parsingStrategy: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getValues, setValue, watch } = useFormContext();

  const isRagEnabled = watch('isRagEnabled');
  const ragFiles = watch('ragFiles');
  const topK = getValues('topK');
  const chunkSize = getValues('chunkSize');
  const chunkBatch = getValues('chunkBatch');
  const parsingStrategy = getValues('parsingStrategy');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isRagEnabled', enabled);
    if (enabled) {
      setValue('isAssistantEnabled', false);
      setValue('isTextToImageEnabled', false);
    }

    if (onToggleRag) {
      onToggleRag(enabled);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      const userEmail = session?.user?.email as string;
      const retrieveRagResponse = await retrieveServices({
        userEmail,
        serviceName: 'rag',
      });
      setValue('isRagEnabled', retrieveRagResponse.isRagEnabled);
      setValue('topK', retrieveRagResponse.topK);
      setValue('chunkSize', retrieveRagResponse.chunkSize);
      setValue('chunkBatch', retrieveRagResponse.chunkBatch);
      setValue('parsingStrategy', retrieveRagResponse.parsingStrategy);
    } catch (error) {
      console.error('Failed to close R.A.G. dialog: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleUpdate = async () => {
    let hasError = false;
    if (!topK) {
      setError((prev) => ({ ...prev, topK: true }));
      hasError = true;
    }
    if (!chunkSize) {
      setError((prev) => ({ ...prev, chunkSize: true }));
      hasError = true;
    }
    if (!chunkBatch) {
      setError((prev) => ({ ...prev, chunkBatch: true }));
      hasError = true;
    }
    if (!parsingStrategy) {
      setError((prev) => ({ ...prev, parsingStrategy: true }));
      hasError = true;
    }
    if (hasError) {
      return;
    } else {
      setError({
        topK: false,
        chunkSize: false,
        chunkBatch: false,
        parsingStrategy: false,
      });
    }
    try {
      setValue('isLoading', true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateRagResponse = await updateRag({
          isRagEnabled,
          userEmail,
          topK,
          chunkSize,
          chunkBatch,
          parsingStrategy,
        });
        console.log('R.A.G. updated successfully: ', updateRagResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating R.A.G.: ', error);
      return new Error('Error updating R.A.G.');
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const userEmail = session?.user?.email as string;
      try {
        setValue('isLoading', true);
        const fileUploadResponse = await uploadRagFile(file, userEmail);
        if (fileUploadResponse?.status === 200) {
          console.log('File uploaded successfully: ', fileUploadResponse);
          const response = fileUploadResponse.file;

          const newFile = {
            id: response.id,
            ragId: response.ragId,
            name: response.name,
            path: response.path,
            type: response.purpose,
            processed: false,
            chunks: [],
          };

          setValue('ragFiles', [...ragFiles, newFile]);
        } else {
          throw new Error('Failed to upload file to R.A.G.');
        }
      } catch (error) {
        console.error('Failed to upload file: ', error);
        return new Error('Failed to upload file');
      } finally {
        setValue('isLoading', false);
      }
    }
  };

  const handleFileDelete = async (file: RagFile) => {
    try {
      setValue('isLoading', true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user found');
      }
      console.log('Deletion process started for:', file);
      if (file.processed) {
        await deleteFileFromVectorDb(file, userEmail, chunkBatch);
      }
      await deleteRagFile({ file, userEmail });
      ragFiles.splice(ragFiles.indexOf(file), 1);
      console.log('File successfully deleted from R.A.G.:', file);
    } catch (error) {
      console.error('Failed to remove file from the R.A.G.: ', error);
      return new Error('Failed to remove file from the R.A.G.');
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleFileProcess = async (file: RagFile) => {
    try {
      setValue('isLoading', true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user found');
      }
      console.log('Document processing started for: ', file.name);

      const parsedDocumentResponse = await parseDocument(
        file,
        chunkSize,
        parsingStrategy
      );

      const embedConversationResponse = await embedConversation(
        parsedDocumentResponse.file,
        userEmail
      );

      ragFiles[ragFiles.indexOf(file)].chunks =
      embedConversationResponse.chunks;

      const upsertToVectorDbResponse = await upsertToVectorDb(
        embedConversationResponse.embeddings,
        userEmail,
        chunkBatch
      );

      if (upsertToVectorDbResponse.status === 200) {
        const updateFileStatusResponse = await updateFileStatus({
          file,
          userEmail,
        });
        ragFiles[ragFiles.indexOf(file)].processed =
          updateFileStatusResponse.file.processed;
        console.log('File processing completed successfully');
      } else {
        throw new Error(
          'Failed to process file',
          upsertToVectorDbResponse.status
        );
      }
    } catch (error) {
      console.error('Failed to process file: ', error);
      throw new Error('Failed to process file');
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDialog-paper': { width: '90%' } }}
    >
      <DialogTitle style={{ textAlign: 'center' }}>R.A.G. Settings</DialogTitle>
      <DialogContent style={{ paddingTop: 5, paddingBottom: 5 }}>
        <RagForm error={error} />
        <RagFileList
          files={ragFiles}
          onDelete={handleFileDelete}
          onProcess={handleFileProcess}
        />
        <Button
          fullWidth
          onClick={handleUpdate}
          style={{ marginBottom: '8px' }}
          variant="outlined"
          color="success"
        >
          Update
        </Button>
      </DialogContent>
      <DialogActions style={{ paddingTop: 0 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          width="100%"
        >
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button onClick={handleCloseClick}>Close Window</Button>
            <Button onClick={handleUploadClick} disabled={!isRagEnabled}>
              Add File
            </Button>
            <Typography variant="caption" sx={{ mx: 1 }}>
              Disable
            </Typography>
            <Switch
              checked={isRagEnabled}
              onChange={handleToggle}
              name="activeRag"
            />
            <Typography variant="caption" sx={{ mx: 1 }}>
              Enable
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RagDialog;
