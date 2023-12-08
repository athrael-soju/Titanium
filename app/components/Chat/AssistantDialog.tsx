import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { updateAssistant } from '@/app/services/assistantService';
import { useSession } from 'next-auth/react';

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onToggleAssistant?: (isActive: boolean) => void;
  onReset?: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AssistantDialog: React.FC<AssistantDialogProps> = ({
  open,
  onClose,
  name,
  setName,
  description,
  setDescription,
  onToggleAssistant,
  onReset,
  setIsLoading,
}) => {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });

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
      setIsLoading(true);
      if (session) {
        const userEmail = session.user?.email as string;
        const response = await updateAssistant({
          name,
          description,
          isActive,
          userEmail,
        });
        console.log('Assistant updated successfully', response);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
    } finally {
      setIsLoading(false);
    }
    onClose();
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(event.target.checked);
    if (onToggleAssistant) {
      onToggleAssistant(event.target.checked);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setIsActive(false);
    setError({ name: false, description: false });
    if (onReset) {
      onReset();
    }
  };

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
          <Typography variant="caption" sx={{ mx: 1 }}>
            Disabled
          </Typography>
          <Switch
            checked={isActive}
            onChange={handleToggle}
            name="activeAssistant"
          />
          <Typography variant="caption" sx={{ mx: 1 }}>
            Enabled
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssistantDialog;
