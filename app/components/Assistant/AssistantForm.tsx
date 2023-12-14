import React from 'react';
import { FormControl, TextField } from '@mui/material';

interface AssistantFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  error: { name: boolean; description: boolean };
}

const AssistantForm: React.FC<AssistantFormProps> = ({
  name,
  setName,
  description,
  setDescription,
  error,
}) => (
  <>
    <FormControl fullWidth margin="dense" error={error.name} variant="outlined">
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
  </>
);

export default AssistantForm;
