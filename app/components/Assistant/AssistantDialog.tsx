import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import {
  updateAssistant,
  deleteAssistantFile,
  deleteAssistant,
} from '@/app/services/assistantService';
import { useSession } from 'next-auth/react';

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
      console.log('Deleting file from the assistant:', file);
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
      let response = await deleteAssistant({ userEmail });
      console.log('Assistant deleted successfully', response);
      files.splice(0, files.length);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error deleting assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ConfirmationDialog = () => (
    <Dialog
      open={isConfirmDialogOpen}
      onClose={() => setIsConfirmDialogOpen(false)}
    >
      <DialogTitle>{'Confirm Delete'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete your Assistant? All associated
          Threads, Messages and Files will also be deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsConfirmDialogOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={performAssistantDelete} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>
        Customize your Personal Assistant
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 8 }}>
        <FormControl
          fullWidth
          margin="dense"
          error={error.name}
          variant="outlined"
        >
          <TextField
            autoFocus
            label="Name"
            fullWidth
            variant="outlined"
            value={name || ''}
            onChange={(e) => setName(e.target.value)}
            error={error.name}
            helperText={error.name ? 'Name is required' : ' '}
          />
        </FormControl>
        <FormControl
          fullWidth
          margin="dense"
          error={error.description}
          variant="outlined"
        >
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            error={error.description}
            helperText={error.description ? 'Description is required' : ' '}
          />
        </FormControl>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
              Attached Files
            </Typography>
            <Box sx={{ height: '160px', overflowY: 'auto' }}>
              <List dense>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleFileDelete(file)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <FolderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
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
      <ConfirmationDialog />
    </Dialog>
  );
};

export default AssistantDialog;
