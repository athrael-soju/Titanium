import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
} from '@mui/material';

interface AddUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUrl: (url: string, name: string) => void;
}

const AddUrlDialog: React.FC<AddUrlDialogProps> = ({
  open,
  onClose,
  onAddUrl,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState({ url: false, name: false });

  const handleAddUrl = () => {
    let hasError = false;
    if (!nameInput.trim()) {
      setError((prev) => ({ ...prev, name: true }));
      hasError = true;
    }
    if (!urlInput.trim()) {
      setError((prev) => ({ ...prev, url: true }));
      hasError = true;
    }
    if (hasError) return;

    onAddUrl(urlInput, nameInput);
    setError({ url: false, name: false });
    onClose();
  };

  const handleClose = () => {
    setError({ name: false, url: false });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>Add URL</DialogTitle>
      <DialogContent style={{ paddingBottom: 8, width: '600px' }}>
        <FormControl
          fullWidth
          margin="dense"
          error={error.name}
          variant="outlined"
        >
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            error={error.name}
            helperText={error.name ? 'Name is required' : ' '}
          />
        </FormControl>
        <FormControl
          fullWidth
          margin="dense"
          error={error.url}
          variant="outlined"
        >
          <TextField
            fullWidth
            label="URL"
            variant="outlined"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            error={error.url}
            helperText={error.url ? 'URL is required' : ' '}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="center" width="100%">
          <Button onClick={handleAddUrl} color="primary">
            Add
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddUrlDialog;
