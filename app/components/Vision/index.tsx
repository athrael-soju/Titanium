import React, { useState, useRef } from 'react';
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
import AddUrlDialog from './AddUrlDialog';
import { useSession } from 'next-auth/react';
import {
  updateVision,
  retrieveVision,
  deleteVisionFile,
} from '@/app/services/visionService';

interface VisionDialogProps {
  open: boolean;
  onClose: () => void;
  isVisionEnabled: boolean;
  setIsVisionEnabled: (isVisionEnabled: boolean) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  visionFiles: { name: string; id: string }[];
  updateVisionFiles: (newVisionFiles: { name: string; id: string }[]) => void;
}

const VisionDialog: React.FC<VisionDialogProps> = ({
  open,
  onClose,
  isVisionEnabled,
  setIsVisionEnabled,
  setIsLoading,
  visionFiles,
  updateVisionFiles,
}) => {
  const { data: session } = useSession();
  const visionFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddUrlDialogOpen, setIsAddUrlDialogOpen] = useState(false);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsVisionEnabled(event.target.checked);
  };

  const handleAddUrlClick = () => {
    setIsAddUrlDialogOpen(true);
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setIsLoading(true);
      const userEmail = session?.user?.email as string;
      const retrieveVisionResponse = await retrieveVision({ userEmail });
      setIsVisionEnabled(retrieveVisionResponse.isVisionEnabled);
    } catch (error) {
      console.error('Failed to close assistant dialog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      if (session) {
        const userEmail = session.user?.email as string;
        await updateVision({
          isVisionEnabled,
          userEmail,
          visionFiles,
        });
        console.log('Vision updated successfully');
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating Vision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlRemove = async (file: any) => {
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

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle style={{ textAlign: 'center' }}>
          Add Vision Images
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 8 }}>
          <VisionFileList files={visionFiles} onDelete={handleUrlRemove} />
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
              <Button onClick={handleAddUrlClick}>Add URL</Button>
              <Typography variant="caption" sx={{ mx: 1 }}>
                Disable
              </Typography>
              <Switch
                checked={isVisionEnabled}
                onChange={handleToggle}
                name="activeVision"
              />
              <Typography variant="caption" sx={{ mx: 1 }}>
                Enable
              </Typography>
              <input
                type="file"
                ref={visionFileInputRef}
                style={{ display: 'none' }}
                onChange={() => {
                  /* Handle file change */
                }}
              />
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      <AddUrlDialog
        open={isAddUrlDialogOpen}
        onClose={() => setIsAddUrlDialogOpen(false)}
        onAddUrl={(url: string) => {
          console.log('URL added:', url);
          // Add your logic to handle the URL here
          visionFiles.push({
            name: 'URL',
            id: 'url',
          });
          updateVisionFiles(visionFiles);
        }}
      />
    </>
  );
};

export default VisionDialog;
