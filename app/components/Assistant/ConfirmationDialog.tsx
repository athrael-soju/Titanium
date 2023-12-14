import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{'Confirm Delete'}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete your Assistant? All associated Threads,
        Messages, and Files will also be deleted.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="secondary">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
