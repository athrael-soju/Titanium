import React from 'react';
import { useFormContext } from 'react-hook-form';

interface SpeechFormProps {
  error: { model: boolean; voice: boolean };
}

const SpeechForm: React.FC<SpeechFormProps> = ({ error }) => {
  const { watch, setValue } = useFormContext();
  const model = watch('model');
  const voice = watch('voice');

  return <></>;
};
export default SpeechForm;
