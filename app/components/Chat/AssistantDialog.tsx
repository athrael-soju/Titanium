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

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleAssistant?: (isActive: boolean) => void;
  onReset?: () => void;
}

const AssistantDialog: React.FC<AssistantDialogProps> = ({
  open,
  onClose,
  onToggleAssistant,
  onReset,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });

  const handleAccept = () => {
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
            value={name}
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
            value={description}
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
            Enabled
          </Typography>
          <Switch
            checked={isActive}
            onChange={handleToggle}
            name="activeAssistant"
          />
          <Typography variant="caption" sx={{ mx: 1 }}>
            Disabled
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssistantDialog;
