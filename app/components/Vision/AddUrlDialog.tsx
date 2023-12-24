import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputBase,
  Box,
} from '@mui/material';

interface AddUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUrl: (url: string) => void;
}

const AddUrlDialog: React.FC<AddUrlDialogProps> = ({
  open,
  onClose,
  onAddUrl,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    onAddUrl(urlInput);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
        },
      }}
    >
      <DialogTitle display="flex" justifyContent="center" width="100%">
        Add URL
      </DialogTitle>
      <DialogContent>
        <InputBase
          fullWidth
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter URL"
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="center" width="100%">
          <Button onClick={handleAddUrl} color="primary">
            Add
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddUrlDialog;
