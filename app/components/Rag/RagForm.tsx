import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface RagFormProps {
  error: { model: boolean; voice: boolean };
}

const RagForm: React.FC<RagFormProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();

  return <></>;
};

export default RagForm;
