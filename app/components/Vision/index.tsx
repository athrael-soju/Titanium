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
  addVisionUrl,
  deleteVisionFile,
} from '@/app/services/visionService';
import { retrieveServices } from '@/app/services/commonService';
import { useFormContext } from 'react-hook-form';
interface VisionDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleVision?: (isVisionEnabled: boolean) => void;
}

const VisionDialog: React.FC<VisionDialogProps> = ({
  open,
  onClose,
  onToggleVision,
}) => {
  const { data: session } = useSession();
  const visionFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddUrlDialogOpen, setIsAddUrlDialogOpen] = useState(false);

  const { setValue, watch } = useFormContext();
  const isVisionEnabled = watch('isVisionEnabled');
  const isVisionDefined = watch('isVisionDefined');
  const visionFiles = watch('visionFiles');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isVisionEnabled', enabled);
    if (enabled) {
      setValue('isAssistantEnabled', false);
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
      const user = session?.user as any;
      const userEmail = user.email;
      let id = crypto.randomUUID();

      const newFile = {
        id: id,
        visionId: '',
        name: nameInput,
        type: 'url',
        url: urlInput,
      };

      const response = await addVisionUrl({ userEmail, file: newFile });

      newFile.visionId = response.file.visionId;
      const newVisionFiles = [...visionFiles, newFile];
      setValue('visionFiles', newVisionFiles);
      await handleUpdate();
    } catch (error) {
      console.error('Failed to add URL to Vision:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      if (isVisionDefined) {
        const userEmail = session?.user?.email as string;
        const retrieveVisionResponse = await retrieveServices({
          userEmail,
          serviceName: 'vision',
        });
        setValue('isVisionEnabled', retrieveVisionResponse.isVisionEnabled);
      } else {
        setValue('isVisionEnabled', false);
      }
    } catch (error) {
      console.error('Failed to close assistant dialog:', error);
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
          isVisionEnabled,
          userEmail,
        });
        setValue('setIsVisionDefined', true);
        console.log('Vision updated successfully', updateVisionResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating Vision:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleRemoveUrl = async (file: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  }) => {
    try {
      setValue('isLoading', true);
      const user = session?.user as any;
      const userEmail = user.email;
      const response = await deleteVisionFile(file, userEmail);
      console.log('File successfully deleted from Vision:', response);
      visionFiles.splice(visionFiles.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from Vision:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle style={{ textAlign: 'center' }}>
          Add Vision Images
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 8 }}>
          <VisionFileList files={visionFiles} onDelete={handleRemoveUrl} />
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
