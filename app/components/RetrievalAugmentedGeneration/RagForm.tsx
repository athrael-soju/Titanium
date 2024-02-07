import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface RagFormProps {
  error: { topK: boolean; chunkBatch: boolean };
}

const RagForm: React.FC<RagFormProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();
  const topK = watch('topK');
  const chunkBatch = watch('chunkBatch');

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="topK-select-label">Top K</InputLabel>
        <Select
          labelId="topK-select-label"
          id="topK-select"
          value={topK}
          label="TopK"
          onChange={(e) => setValue('topK', e.target.value as string)}
          error={error.topK}
        >
          <MenuItem value={'10'}>10</MenuItem>
          <MenuItem value={'20'}>20</MenuItem>
          <MenuItem value={'50'}>50</MenuItem>
          <MenuItem value={'100'}>100</MenuItem>
          <MenuItem value={'1000'}>1000</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="chunkBatch-select-label">Batch Size</InputLabel>
        <Select
          labelId="chunkBatch-select-label"
          id="chunkBatch-select"
          value={chunkBatch}
          label="ChunkBatch"
          onChange={(e) => setValue('chunkBatch', e.target.value as string)}
          error={error.chunkBatch}
        >
          <MenuItem value={'50'}>50</MenuItem>
          <MenuItem value={'100'}>100</MenuItem>
          <MenuItem value={'150'}>150</MenuItem>
          <MenuItem value={'200'}>200</MenuItem>
          <MenuItem value={'250'}>250</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export default RagForm;
