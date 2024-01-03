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
import AssistantForm from './AssistantForm';
import FileList from './FileList';
import ConfirmationDialog from './ConfirmationDialog';
import { useSession } from 'next-auth/react';
import {
  updateAssistant,
  deleteAssistantFile,
  deleteAssistant,
  uploadFile,
} from '@/app/services/assistantService';
import { retrieveServices } from '@/app/services/commonService';
import { useFormContext } from 'react-hook-form';
interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isAssistantDefined: boolean;
  setIsAssistantDefined: (isAssistantDefined: boolean) => void;
  onToggleAssistant?: (isAssistantEnabled: boolean) => void;
  onReset?: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  files: { name: string; id: string; assistandId: string }[];
  updateFiles: (
    newFiles: { name: string; id: string; assistandId: string }[]
  ) => void;
}

const AssistantDialog: React.FC<AssistantDialogProps> = ({
  open,
  onClose,
  name,
  setName,
  description,
  setDescription,
  isAssistantDefined,
  setIsAssistantDefined,
  onToggleAssistant,
  onReset,
  setIsLoading,
  files,
  updateFiles,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formContext = useFormContext();
  const { setValue, watch } = formContext;
  const isAssistantEnabled = watch('isAssistantEnabled');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isAssistantEnabled', enabled);
    if (enabled) {
      setValue('isVisionEnabled', false);
    }

    if (onToggleAssistant) {
      onToggleAssistant(enabled);
    }
  };

  const handleCreate = async () => {
    let hasError = false;
    if (!name) {
      setError((prev) => ({ ...prev, name: true }));
      hasError = true;
    }
    if (!description) {
      setError((prev) => ({ ...prev, description: true }));
      hasError = true;
    }
    if (hasError) {
      return;
    } else {
      setError({ name: false, description: false });
    }

    try {
      setIsLoading(true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateAssistantResponse = await updateAssistant({
          name,
          description,
          isAssistantEnabled,
          userEmail,
          files,
        });
        setIsAssistantDefined(true);
        console.log('Assistant updated successfully', updateAssistantResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setIsLoading(true);
      if (isAssistantDefined) {
        const userEmail = session?.user?.email as string;
        const retrieveAssistantResponse = await retrieveServices({
          userEmail,
          serviceName: 'assistant',
        });
        setName(retrieveAssistantResponse.assistant.name);
        setDescription(retrieveAssistantResponse.assistant.instructions);
        setValue(
          'isAssistantEnabled',
          retrieveAssistantResponse.isAssistantEnabled
        );
      } else {
        setName('');
        setDescription('');
        setValue('isAssistantEnabled', false);
      }
    } catch (error) {
      console.error('Failed to close assistant dialog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setValue('isAssistantEnabled', false);
    setError({ name: false, description: false });
    if (onReset) {
      onReset();
    }
  };

  const handleFileDelete = async (file: any) => {
    try {
      setIsLoading(true);
      await deleteAssistantFile({ file });
      console.log('File successfully deleted from the assistant:', file);
      files.splice(files.indexOf(file), 1);
    } catch (error) {
      console.error('Failed to remove file from the assistant:', error);
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
        const fileUploadResponse = await uploadFile(file, userEmail);
        const retrieveAssistantResponse = await retrieveServices({
          userEmail,
          serviceName: 'assistant',
        });
        if (retrieveAssistantResponse.assistant) {
          updateFiles(retrieveAssistantResponse.fileList);
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

  const handleAssistantDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  const performAssistantDelete = async () => {
    setIsConfirmDialogOpen(false);
    const userEmail = session?.user?.email as string;
    try {
      setIsLoading(true);
      await deleteAssistant({ userEmail });
      console.log('Assistant deleted successfully');
      files.splice(0, files.length);
      handleReset();
      setIsAssistantDefined(false);
    } catch (error) {
      console.error('Error deleting assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>
        {!isAssistantDefined
          ? 'Create Assistant'
          : `Customize Assistant: ${name}`}
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
          flexDirection="column"
          alignItems="stretch"
          width="100%"
        >
          <Button
            onClick={handleCreate}
            style={{ marginBottom: '8px' }}
            variant="outlined"
            color="success"
          >
            {isAssistantDefined ? 'Update' : 'Create'}
          </Button>
          <Button
            onClick={handleAssistantDelete}
            disabled={!isAssistantDefined}
            style={{ marginBottom: '8px' }}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button onClick={handleCloseClick}>Close Window</Button>
            <Button onClick={handleUploadClick} disabled={!isAssistantDefined}>
              Add File
            </Button>
            <Typography variant="caption" sx={{ mx: 1 }}>
              Disable
            </Typography>
            <Switch
              checked={isAssistantEnabled}
              onChange={handleToggle}
              name="activeAssistant"
              disabled={!isAssistantDefined}
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

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={performAssistantDelete}
      />
    </Dialog>
  );
};

export default AssistantDialog;
