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
import { retrieveServices } from '@/app/services/commonService';
import {
  updateRag,
  uploadRagFile,
  deleteRagFile,
  updateFileStatus,
} from '@/app/services/ragService';
import { useFormContext } from 'react-hook-form';
import RagForm from './RagForm';
import RagFileList from './RagFileList';
import { parseDocument } from '@/app/services/unstructuredService';
import { generateEmbeddings } from '@/app/services/embeddingService';
import { upsertToVectorDb } from '@/app/services/vectorDbService';

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
  const [error, setError] = useState<{ model: boolean; voice: boolean }>({
    model: false,
    voice: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setValue, watch } = useFormContext();
  const isRagEnabled = watch('isRagEnabled');
  const ragFiles = watch('ragFiles');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isRagEnabled', enabled);
    if (enabled) {
      setValue('isAssistantEnabled', false);
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
      if (isRagEnabled) {
        const userEmail = session?.user?.email as string;
        const retrieveRagResponse = await retrieveServices({
          userEmail,
          serviceName: 'rag',
        });
        console.log('R.A.G. retrieved successfully: ', retrieveRagResponse);
        setValue('isRagEnabled', retrieveRagResponse.isRagEnabled);
      } else {
        setValue('isRagEnabled', false);
      }
    } catch (error) {
      console.error('Failed to close R.A.G. dialog:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleUpdate = async () => {
    try {
      setValue('isLoading', true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateRagResponse = await updateRag({
          isRagEnabled,
          userEmail,
        });
        console.log('R.A.G. updated successfully: ', updateRagResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating R.A.G.:', error);
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
          };
          const newRagFiles = [...ragFiles, newFile];
          setValue('ragFiles', newRagFiles);
          await handleUpdate();
        } else {
          throw new Error('Failed to upload file to R.A.G.');
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
      } finally {
        setValue('isLoading', false);
      }
    }
  };

  const handleFileDelete = async (file: RagFile) => {
    try {
      setValue('isLoading', true);
      const user = session?.user as any;
      const userEmail = user.email;
      await deleteRagFile({ file, userEmail });
      ragFiles.splice(ragFiles.indexOf(file), 1);

      console.log('File successfully deleted from R.A.G.:', file);
    } catch (error) {
      console.error('Failed to remove file from the R.A.G.:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleFileProcess = async (file: RagFile) => {
    try {
      setValue('isLoading', true);
      const user = session?.user as any;
      const userEmail = user.email;
      console.log('Document processing started for: ', file.name);
      const parsedDocumentResponse = await parseDocument(file.path);
      const generateEmbeddingsResponse = await generateEmbeddings(
        parsedDocumentResponse.file,
        userEmail
      );
      const upsertToVectorDbResponse = await upsertToVectorDb(
        generateEmbeddingsResponse,
        userEmail
      );

      if (upsertToVectorDbResponse.status === 200) {
        const updateFileStatusResponse = await updateFileStatus({
          file,
          userEmail,
        });
        ragFiles[ragFiles.indexOf(file)].processed =
          updateFileStatusResponse.file.processed;
        console.log('File processing completed successfully.');
      }
    } catch (error) {
      console.error('Failed to process file:', error);
      throw new Error('Failed to process file');
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>R.A.G. Settings</DialogTitle>
      <DialogContent style={{ paddingBottom: 8 }}>
        <RagForm error={error} />
        <RagFileList
          files={ragFiles}
          onDelete={handleFileDelete}
          onProcess={handleFileProcess}
        />
      </DialogContent>
      <DialogContent style={{ paddingTop: 5, paddingBottom: 5 }}>
        <RagForm error={error} />
      </DialogContent>
      <DialogActions style={{ paddingTop: 0 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          width="100%"
        >
          <Button
            onClick={handleUpdate}
            style={{ marginBottom: '8px' }}
            variant="outlined"
            color="success"
          >
            Update
          </Button>
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
              name="activeVision"
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
