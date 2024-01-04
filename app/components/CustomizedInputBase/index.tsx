import React, { useState, useRef, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AssistantIcon from '@mui/icons-material/Assistant';
import VisionIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import AssistantDialog from '../Assistant';
import VisionDialog from '../Vision';
import { retrieveServices } from '@/app/services/commonService';

const CustomizedInputBase = ({
  setIsLoading,
  onSendMessage,
}: {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSendMessage: (message: string) => void;
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = React.useState(false);

  const { setValue, watch, getValues } = useFormContext();

  // const name = getValues('name');
  // const description = getValues('description');
  // const isAssistantEnabled = watch('isAssistantEnabled');
  // const isAssistantDefined = watch('isAssistantDefined');
  // const isVisionEnabled = watch('isVisionEnabled');
  // const isVisionDefined = watch('isVisionDefined');

  const files = useRef<{ name: string; id: string; assistandId: string }[]>([]);
  const updateFiles = (
    newFiles: { name: string; id: string; assistandId: string }[]
  ) => {
    files.current = newFiles;
  };
  const visionFiles = useRef<
    { id: string; visionId: string; name: string; type: string; url: string }[]
  >([]);
  const updateVisionFiles = (
    newVisionFiles: {
      id: string;
      visionId: string;
      name: string;
      type: string;
      url: string;
    }[]
  ) => {
    visionFiles.current = newVisionFiles;
  };
  useEffect(() => {
    const prefetchData = async () => {
      if (session) {
        try {
          setIsLoading(true);
          const userEmail = session.user?.email as string;
          let response = await retrieveServices({
            userEmail,
            serviceName: 'assistant',
          });
          if (response.assistant) {
            setValue('name', response.assistant.name);
            setValue('description', response.assistant.instructions);
            setValue('isAssistantEnabled', response.isAssistantEnabled);
            files.current = response.fileList;
            setValue('isAssistantDefined', true);
          } else {
            setValue('isAssistantDefined', false);
            setValue('isAssistantEnabled', false);
          }
          response = await retrieveServices({
            userEmail,
            serviceName: 'vision',
          });
          if (response.visionId) {
            setValue('isVisionEnabled', response.isVisionEnabled);
            visionFiles.current = response.visionFileList;
            setValue('isVisionDefined', true);
          } else {
            setValue('isVisionEnabled', false);
          }
        } catch (error) {
          console.error('Error prefetching services:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    prefetchData();
  }, [session, setIsLoading, setValue]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssistantsClick = async () => {
    setIsAssistantDialogOpen(true);
    handleMenuClose();
  };

  const handleVisionClick = () => {
    setIsVisionDialogOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: isSmallScreen ? '100%' : 600,
        }}
        onKeyDown={handleKeyDown}
      >
        <IconButton
          sx={{ p: '10px' }}
          aria-label="menu"
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleAssistantsClick}>
            <ListItemIcon>
              <AssistantIcon />
            </ListItemIcon>
            Assistant
          </MenuItem>
          <MenuItem onClick={handleVisionClick}>
            <ListItemIcon>
              <VisionIcon fontSize="small" />{' '}
            </ListItemIcon>
            Vision
          </MenuItem>
        </Menu>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Enter your message"
          value={inputValue}
          onChange={handleInputChange}
        />
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          aria-label="send"
          onClick={handleSendClick}
        >
          <SendIcon />
        </IconButton>
      </Paper>

      <AssistantDialog
        open={isAssistantDialogOpen}
        onClose={() => setIsAssistantDialogOpen(false)}
        setIsLoading={setIsLoading}
        files={files.current}
        updateFiles={updateFiles}
      />

      <VisionDialog
        open={isVisionDialogOpen}
        onClose={() => setIsVisionDialogOpen(false)}
        setIsLoading={setIsLoading}
        visionFiles={visionFiles.current}
        updateVisionFiles={updateVisionFiles}
      />
    </>
  );
};

export default CustomizedInputBase;
