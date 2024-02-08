import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Switch,
  Typography,
  Box,
  DialogContent,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';

import { retrieveServices } from '@/app/services/commonService';
import { updateSpeech } from '@/app/services/textToSpeechService';
import SpeechForm from './SpeechForm';

interface SpeechDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleSpeech?: (isTextToSpeechEnabled: boolean) => void;
}

const SpeechDialog: React.FC<SpeechDialogProps> = ({
  open,
  onClose,
  onToggleSpeech,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState<{ model: boolean; voice: boolean }>({
    model: false,
    voice: false,
  });
  const visionFileInputRef = useRef<HTMLInputElement>(null);
  const { getValues, setValue, watch } = useFormContext();

  const isTextToSpeechEnabled = watch('isTextToSpeechEnabled');
  const model = getValues('model');
  const voice = getValues('voice');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isTextToSpeechEnabled', enabled);

    if (onToggleSpeech) {
      onToggleSpeech(enabled);
    }
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      const userEmail = session?.user?.email as string;
      const retrieveSpeechResponse = await retrieveServices({
        userEmail,
        serviceName: 'speech',
      });
      setValue(
        'isTextToSpeechEnabled',
        retrieveSpeechResponse.isTextToSpeechEnabled
      );
      setValue('model', retrieveSpeechResponse.model);
      setValue('voice', retrieveSpeechResponse.voice);
    } catch (error) {
      console.error('Failed to close assistant dialog:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleUpdate = async () => {
    let hasError = false;
    if (!model) {
      setError((prev) => ({ ...prev, model: true }));
      hasError = true;
    }
    if (!voice) {
      setError((prev) => ({ ...prev, voice: true }));
      hasError = true;
    }
    if (hasError) {
      return;
    } else {
      setError({ model: false, voice: false });
    }
    try {
      setValue('isLoading', true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateSpeechResponse = await updateSpeech({
          isTextToSpeechEnabled,
          userEmail,
          model,
          voice,
        });
        console.log('Speech updated successfully', updateSpeechResponse);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating Vision:', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>Speech Settings</DialogTitle>
      <DialogContent style={{ paddingTop: 5, paddingBottom: 5 }}>
        <SpeechForm error={error} />
        <Button
          fullWidth
          onClick={handleUpdate}
          style={{ marginTop: 8, marginBottom: 8 }}
          variant="outlined"
          color="success"
        >
          Update
        </Button>
      </DialogContent>
      <DialogActions style={{ paddingTop: 0 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          width="100%"
        >
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button onClick={handleCloseClick}>Close Window</Button>
            <Typography variant="caption" sx={{ mx: 1 }}>
              Disable
            </Typography>
            <Switch
              checked={isTextToSpeechEnabled}
              onChange={handleToggle}
              name="activeSpeech"
            />
            <Typography variant="caption" sx={{ mx: 1 }}>
              Enable
            </Typography>
            <input
              type="file"
              ref={visionFileInputRef}
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SpeechDialog;
