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
import ImageFileList from './ImageFileList';
import AddUrlDialog from './AddUrlDialog';
import { useSession } from 'next-auth/react';
import {
  updateImageToText,
  addImageToTextUrl,
  deleteImageFile,
} from '@/app/services/imageToTextService';
import { retrieveServices } from '@/app/services/commonService';
import { useFormContext } from 'react-hook-form';
interface ImageToTextDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleImageToText?: (isImageToTextEnabled: boolean) => void;
}

const ImageToTextDialog: React.FC<ImageToTextDialogProps> = ({
  open,
  onClose,
  onToggleImageToText,
}) => {
  const { data: session } = useSession();
  const imageToTextFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddUrlDialogOpen, setIsAddUrlDialogOpen] = useState(false);

  const { setValue, watch } = useFormContext();
  const isImageToTextEnabled = watch('isImageToTextEnabled');
  const isImageToTextDefined = watch('isImageToTextDefined');
  const ImageFiles = watch('ImageFiles');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isImageToTextEnabled', enabled);
    if (enabled) {
      setValue('isAssistantEnabled', false);
      setValue('isRagEnabled', false);
    }

    if (onToggleImageToText) {
      onToggleImageToText(enabled);
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
        imageId: '',
        name: nameInput,
        type: 'url',
        url: urlInput,
      };

      const response = await addImageToTextUrl({ userEmail, file: newFile });
      if (response.status === 200) {
        newFile.imageId = response.file.imageId;
        const newImageFiles = [...ImageFiles, newFile];
        setValue('ImageFiles', newImageFiles);
        await handleUpdate();
      } else {
        throw new Error('Failed to add URL to ImageToText');
      }
    } catch (error) {
      console.error('Failed to add URL to ImageToText: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      if (isImageToTextDefined) {
        const userEmail = session?.user?.email as string;
        const retrieveImageToTextResponse = await retrieveServices({
          userEmail,
          serviceName: 'vision',
        });
        setValue(
          'isImageToTextEnabled',
          retrieveImageToTextResponse.isImageToTextEnabled
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
        const updateImageToTextResponse = await updateImageToText({
          isImageToTextEnabled,
          userEmail,
        });
        setValue('isImageToTextDefined', true);
        console.log('ImageToText updated successfully', updateImageToTextResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating ImageToText: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleRemoveUrl = async (file: {
    id: string;
    imageId: string;
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
      const response = await deleteImageFile(file, userEmail);
      console.log('File successfully deleted from ImageToText:', response);
      ImageFiles.splice(ImageFiles.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from ImageToText: ', error);
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
          <ImageFileList files={ImageFiles} onDelete={handleRemoveUrl} />
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
                checked={isImageToTextEnabled}
                onChange={handleToggle}
                name="activeImageToText"
              />
              <Typography variant="caption" sx={{ mx: 1 }}>
                Enable
              </Typography>
              <input
                type="file"
                ref={imageToTextFileInputRef}
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

export default ImageToTextDialog;
