import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  Typography,
  Box,
} from '@mui/material';
import VisionFileList from './VisionFileList';
import { useSession } from 'next-auth/react';
import {
  retrieveVision,
  deleteVisionFile,
  uploadVisionFile,
} from '@/app/services/visionService';

interface VisionDialogProps {
  open: boolean;
  onClose: () => void;
  isVisionEnabled: boolean;
  setIsVisionEnabled: (isVisionEnabled: boolean) => void;
  onToggleVision?: (isVisionEnabled: boolean) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  visionFiles: { name: string; id: string }[];
  updateVisionFiles: (newVisionFiles: { name: string; id: string }[]) => void;
}

const VisionDialog: React.FC<VisionDialogProps> = ({
  open,
  onClose,
  isVisionEnabled,
  setIsVisionEnabled,
  onToggleVision,
  setIsLoading,
  visionFiles,
  updateVisionFiles,
}) => {
  const { data: session } = useSession();
  const visionFileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsVisionEnabled(event.target.checked);
    if (onToggleVision) {
      onToggleVision(event.target.checked);
    }
  };

  const handleUploadClick = () => {
    visionFileInputRef.current?.click();
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setIsLoading(true);

      const userEmail = session?.user?.email as string;
      const retrieveVisionResponse = await retrieveVision({
        userEmail,
      });
      setIsVisionEnabled(retrieveVisionResponse.isVisionEnabled);
    } catch (error) {
      console.error('Failed to close assistant dialog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDelete = async (file: any) => {
    try {
      setIsLoading(true);
      await deleteVisionFile({ file });
      console.log('File successfully deleted from Vision:', file);
      visionFiles.splice(visionFiles.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from Vision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const userEmail = session?.user?.email as string;
      try {
        setIsLoading(true);
        const fileUploadResponse = await uploadVisionFile(file, userEmail);
        const retrieveAssistantResponse = await retrieveVision({
          userEmail,
        });
        if (retrieveAssistantResponse.assistant) {
          updateVisionFiles(retrieveAssistantResponse.VisionFileList);
        }
        if (fileUploadResponse?.status === 200) {
          console.log('File uploaded successfully', fileUploadResponse);
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>
        Add Vision Images
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 8 }}>
        <VisionFileList files={visionFiles} onDelete={handleFileDelete} />
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
            <Button onClick={handleUploadClick} disabled={!isVisionEnabled}>
              Add File
            </Button>
            <Typography variant="caption" sx={{ mx: 1 }}>
              Disable
            </Typography>
            <Switch
              checked={isVisionEnabled}
              onChange={handleToggle}
              name="activeAssistant"
              disabled={!isVisionEnabled}
            />
            <Typography variant="caption" sx={{ mx: 1 }}>
              Enable
            </Typography>
            <input
              type="file"
              ref={visionFileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VisionDialog;
