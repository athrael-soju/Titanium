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
import { updateSettings } from '@/app/services/longTermMemoryService';
import LongTermMemoryForm from './LongTermMemoryForm';

interface LongTermMemoryDialogProps {
  open: boolean;
  onClose: () => void;
  onToggleLongTermMemory?: (isLongTermMemoryEnabled: boolean) => void;
}

const LongTermMemoryDialog: React.FC<LongTermMemoryDialogProps> = ({
  open,
  onClose,
  onToggleLongTermMemory,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState<{
    memoryType: boolean;
    historyLength: boolean;
  }>({
    memoryType: false,
    historyLength: false,
  });
  const longTermMemoryInputFileRef = useRef<HTMLInputElement>(null);
  const { getValues, setValue, watch } = useFormContext();

  const isLongTermMemoryEnabled = watch('isLongTermMemoryEnabled');
  const memoryType = getValues('memoryType');
  const historyLength = getValues('historyLength');

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setValue('isLongTermMemoryEnabled', enabled);

    if (onToggleLongTermMemory) {
      onToggleLongTermMemory(enabled);
    }
  };

  const handleCloseClick = async () => {
    try {
      onClose();
      setValue('isLoading', true);
      const userEmail = session?.user?.email as string;
      const retrieveLongTermMemoryResponse = await retrieveServices({
        userEmail,
        serviceName: 'memory',
      });
      setValue(
        'isLongTermMemoryEnabled',
        retrieveLongTermMemoryResponse.isLongTermMemoryEnabled
      );
      setValue('memoryType', retrieveLongTermMemoryResponse.memoryType);
      setValue('historyLength', retrieveLongTermMemoryResponse.historyLength);
    } catch (error) {
      console.error('Failed to close Long term memory dialog: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  const handleUpdate = async () => {
    let hasError = false;
    if (!memoryType) {
      setError((prev) => ({ ...prev, memoryType: true }));
      hasError = true;
    }
    if (!historyLength) {
      setError((prev) => ({ ...prev, historyLength: true }));
      hasError = true;
    }
    if (hasError) {
      return;
    } else {
      setError({ memoryType: false, historyLength: false });
    }
    try {
      setValue('isLoading', true);
      if (session) {
        const userEmail = session.user?.email as string;
        const updateSettingsResponse = await updateSettings({
          isLongTermMemoryEnabled,
          userEmail,
          memoryType,
          historyLength,
        });
        console.log(
          'Long term memory updated successfully',
          updateSettingsResponse
        );
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error updating Long term memory: ', error);
    } finally {
      setValue('isLoading', false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textAlign: 'center' }}>
        Long Term Memory Settings
      </DialogTitle>
      <DialogContent style={{ paddingTop: 5, paddingBottom: 5 }}>
        <LongTermMemoryForm error={error} />
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
              checked={isLongTermMemoryEnabled}
              onChange={handleToggle}
              name="activeLongTermMemory"
            />
            <Typography variant="caption" sx={{ mx: 1 }}>
              Enable
            </Typography>
            <input
              type="file"
              ref={longTermMemoryInputFileRef}
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LongTermMemoryDialog;
