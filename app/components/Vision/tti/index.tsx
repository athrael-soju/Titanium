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
import TextToImageFileList from './TextToImageFileList';
import AddUrlDialog from './AddUrlDialog';
import { useSession } from 'next-auth/react';
import {
  updateVision,
  addTextToImageUrl,
  deleteTextToImageFile,
} from '@/app/services/visionService';
import { retrieveServices } from '@/app/services/commonService';
import { useFormContext } from 'react-hook-form';
interface VisionDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleVision?: (isTextToImageEnabled: boolean) => void;
}

const VisionDialog: React.FC<VisionDialogProps> = ({
  open,
  onClose,
  onToggleVision,
}) => {
  const { data: session } = useSession();
  const textToImageFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddUrlDialogOpen, setIsAddUrlDialogOpen] = useState(false);

  const { setValue, watch } = useFormContext();
  const isTextToImageEnabled = watch('isTextToImageEnabled');
  const isTextToImageDefined = watch('isTextToImageDefined');
  const textToImageFiles = watch('textToImageFiles');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isTextToImageEnabled', enabled);
    if (enabled) {
      setValue('isAssistantEnabled', false);
      setValue('isRagEnabled', false);
    }

    if (onToggleVision) {
      onToggleVision(enabled);
    }
  };

  const handleAddUrlClick = () => {
    setIsAddUrlDialogOpen(true);
  };

  const handleAddUrl = async (urlInput: string, nameInput: string) => {
    try {
      setValue('isLoading', true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user found');
      }
      let id = crypto.randomUUID();

      const newFile = {
        id: id,
        textToImageId: '',
        name: nameInput,
        type: 'url',
        url: urlInput,
      };

      const response = await addTextToImageUrl({ userEmail, file: newFile });
      if (response.status === 200) {
        newFile.textToImageId = response.file.textToImageId;
        const newTextToImageFiles = [...textToImageFiles, newFile];
        setValue('textToImageFiles', newTextToImageFiles);
        await handleUpdate();
      } else {
        throw new Error('Failed to add URL to TextToImage');
      }
    } catch (error) {
      console.error('Failed to add URL to TextToImage: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      if (isTextToImageDefined) {
        const userEmail = session?.user?.email as string;
        const retrieveVisionResponse = await retrieveServices({
          userEmail,
          serviceName: 'vision',
        });
        setValue(
          'isTextToImageEnabled',
          retrieveVisionResponse.isTextToImageEnabled
        );
      }
    } catch (error) {
      console.error('Failed to close assistant dialog: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleUpdate = async () => {
    try {
      setValue('isLoading', true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateVisionResponse = await updateVision({
          isTextToImageEnabled,
          userEmail,
        });
        setValue('isTextToImageDefined', true);
        console.log('Vision updated successfully', updateVisionResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating vision: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleRemoveUrl = async (file: {
    id: string;
    textToImageId: string;
    name: string;
    type: string;
    url: string;
  }) => {
    try {
      setValue('isLoading', true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user found');
      }
      const response = await deleteTextToImageFile(file, userEmail);
      console.log('File successfully deleted from TextToImage:', response);
      textToImageFiles.splice(textToImageFiles.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from TextToImage: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle style={{ textAlign: 'center' }}>
          Vision Settings
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 8 }}>
          <TextToImageFileList
            files={textToImageFiles}
            onDelete={handleRemoveUrl}
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
              <Button onClick={handleAddUrlClick}>Add URL</Button>
              <Typography variant="caption" sx={{ mx: 1 }}>
                Disable
              </Typography>
              <Switch
                checked={isTextToImageEnabled}
                onChange={handleToggle}
                name="activeVision"
              />
              <Typography variant="caption" sx={{ mx: 1 }}>
                Enable
              </Typography>
              <input
                type="file"
                ref={textToImageFileInputRef}
                style={{ display: 'none' }}
              />
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      <AddUrlDialog
        open={isAddUrlDialogOpen}
        onClose={() => setIsAddUrlDialogOpen(false)}
        onAddUrl={handleAddUrl}
      />
    </>
  );
};

export default VisionDialog;
