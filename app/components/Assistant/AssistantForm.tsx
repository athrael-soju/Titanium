import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface AssistantFormProps {
  error: { name: boolean; description: boolean };
}

const AssistantForm: React.FC<AssistantFormProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();
  const name = watch('name');
  const description = watch('description');

  return (
    <>
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
          onChange={(e) => setValue('name', e.target.value)}
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
          onChange={(e) => setValue('description', e.target.value)}
          error={error.description}
          helperText={error.description ? 'Description is required' : ' '}
        />
      </FormControl>
    </>
  );
};
export default AssistantForm;
