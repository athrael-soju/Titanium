import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface RagFormProps {
  error: {
    topK: boolean;
    chunkSize: boolean;
    chunkBatch: boolean;
    parsingStrategy: boolean;
  };
}

const RagForm: React.FC<RagFormProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();
  const topK = watch('topK');
  const chunkSize = watch('chunkSize');
  const chunkBatch = watch('chunkBatch');
  const parsingStrategy = watch('parsingStrategy');

  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <FormControl margin="dense" sx={{ flexGrow: 1, marginRight: '16px' }}>
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
      <FormControl margin="dense" sx={{ flexGrow: 1, marginRight: '16px' }}>
        <InputLabel id="chunkSize-select-label">Chunk Size</InputLabel>
        <Select
          labelId="chunkSize-select-label"
          id="chunkSize-select"
          value={chunkSize}
          label="ChunkSize"
          onChange={(e) => setValue('chunkSize', e.target.value as string)}
          error={error.chunkSize}
        >
          <MenuItem value={'500'}>500</MenuItem>
          <MenuItem value={'1000'}>1000</MenuItem>
          <MenuItem value={'1500'}>1500</MenuItem>
          <MenuItem value={'2000'}>2000</MenuItem>
        </Select>
      </FormControl>
      <FormControl margin="dense" sx={{ flexGrow: 1, marginRight: '16px' }}>
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
      <FormControl margin="dense" sx={{ flexGrow: 1 }}>
        <InputLabel id="parsingStrategy-select-label">
          Parsing Strategy
        </InputLabel>
        <Select
          labelId="parsingStrategy-select-label"
          id="parsingStrategy-select"
          value={parsingStrategy}
          label="ParsingStrategy"
          onChange={(e) =>
            setValue('parsingStrategy', e.target.value as string)
          }
          error={error.parsingStrategy}
        >
          <MenuItem value={'hi_res'}>Hi Res</MenuItem>
          <MenuItem value={'fast'}>Fast</MenuItem>
          <MenuItem value={'auto'}>Auto</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default RagForm;
