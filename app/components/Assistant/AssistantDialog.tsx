import React, { useState } from 'react';
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
import AssistantForm from './AssistantForm';
import FileList from './FileList';
import ConfirmationDialog from './ConfirmationDialog';
import { useSession } from 'next-auth/react';
import {
  updateAssistant,
  deleteAssistantFile,
  deleteAssistant,
} from '@/app/services/assistantService';

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isAssistantEnabled: boolean;
  setIsAssistantEnabled: (isAssistantEnabled: boolean) => void;
  onToggleAssistant?: (isAssistantEnabled: boolean) => void;
  onReset?: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  files: { name: string; id: string; assistandId: string }[];
}

const AssistantDialog: React.FC<AssistantDialogProps> = ({
  open,
  onClose,
  name,
  setName,
  description,
  setDescription,
  isAssistantEnabled,
  setIsAssistantEnabled,
  onToggleAssistant,
  onReset,
  setIsLoading,
  files,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleAccept = async () => {
    let hasError = false;
    if (!name) {
      setError((prev) => ({ ...prev, name: true }));
      hasError = true;
    }
    if (!description) {
      setError((prev) => ({ ...prev, description: true }));
      hasError = true;
    }
    if (hasError) return;

    try {
      onClose();
      setIsLoading(true);
      if (session) {
        const userEmail = session.user?.email as string;
        await updateAssistant({
          name,
          description,
          isAssistantEnabled,
          userEmail,
        });
        console.log('Assistant updated successfully');
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAssistantEnabled(event.target.checked);
    if (onToggleAssistant) {
      onToggleAssistant(event.target.checked);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setIsAssistantEnabled(false);
    setError({ name: false, description: false });
    if (onReset) {
      onReset();
    }
  };

  const handleFileDelete = async (file: any) => {
    try {
      setIsLoading(true);
      let response = await deleteAssistantFile({ file });
      console.log('File successfully deleted from the assistant:', response);
      files.splice(files.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from the assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistantDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  const performAssistantDelete = async () => {
    setIsConfirmDialogOpen(false);
    const userEmail = session?.user?.email as string;
    try {
      setIsLoading(true);
      onClose();
      let response = await deleteAssistant({ userEmail });
      console.log('Assistant deleted successfully', response);
      files.splice(0, files.length);
      handleReset();
    } catch (error) {
      console.error('Error deleting assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>
        Customize your Assistant
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 8 }}>
        <AssistantForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          error={error}
        />
        <FileList files={files} onDelete={handleFileDelete} />
      </DialogContent>
      <DialogActions style={{ paddingTop: 0 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <Button onClick={handleAccept}>Accept</Button>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssistantDelete}>Delete</Button>
          <Typography variant="caption" sx={{ mx: 1 }}>
            Off
          </Typography>
          <Switch
            checked={isAssistantEnabled}
            onChange={handleToggle}
            name="activeAssistant"
          />
          <Typography variant="caption" sx={{ mx: 1 }}>
            On
          </Typography>
        </Box>
      </DialogActions>
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={performAssistantDelete}
      />
    </Dialog>
  );
};

export default AssistantDialog;
