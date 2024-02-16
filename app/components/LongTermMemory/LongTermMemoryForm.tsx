import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface LongTermMemoryProps {
  error: { memoryType: boolean; historyLength: boolean };
}

const LongTermMemoryForm: React.FC<LongTermMemoryProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();
  const memoryType = watch('memoryType');
  const historyLength = watch('historyLength');

  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <FormControl margin="dense" sx={{ flexGrow: 1, marginRight: '16px' }}>
        <InputLabel id="memoryType-select-label">Memory Type</InputLabel>
        <Select
          labelId="memoryType-select-label"
          id="memoryType-select"
          value={memoryType}
          label="MemoryType"
          onChange={(e) => setValue('memoryType', e.target.value as string)}
          error={error.memoryType}
        >
          <MenuItem value={'NoSQL'}>NoSQL</MenuItem>
          <MenuItem value={'Vector'}>Vector</MenuItem>
        </Select>
      </FormControl>
      <FormControl margin="dense" sx={{ flexGrow: 1 }}>
        <InputLabel id="memoryType-select-label">History Length</InputLabel>
        <Select
          labelId="historyLength-select-label"
          id="historyLength-select"
          value={historyLength}
          label="historyLength"
          onChange={(e) => setValue('historyLength', e.target.value as string)}
          error={error.historyLength}
        >
          <MenuItem value={'10'}>10</MenuItem>
          <MenuItem value={'20'}>20</MenuItem>
          <MenuItem value={'50'}>20</MenuItem>
          <MenuItem value={'100'}>20</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LongTermMemoryForm;
