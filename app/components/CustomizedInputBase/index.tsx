import React, { useState, useEffect } from 'react';
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
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';
import AssistantDialog from '../Assistant';
import VisionDialog from '../Vision';
import SpeechDialog from '../Speech';
import { retrieveServices } from '@/app/services/commonService';

const CustomizedInputBase = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = React.useState(false);
  const [isSpeechDialogOpen, setIsSpeechDialogOpen] = React.useState(false);
  const { setValue } = useFormContext();

  useEffect(() => {
    const prefetchData = async () => {
      if (session) {
        try {
          setValue('isLoading', true);
          const userEmail = session.user?.email as string;
          let response = await retrieveServices({
            userEmail,
            serviceName: 'assistant',
          });
          if (response.assistant) {
            setValue('name', response.assistant.name);
            setValue('description', response.assistant.instructions);
            setValue('isAssistantEnabled', response.isAssistantEnabled);
            setValue('assistantFiles', response.fileList);
            setValue('isAssistantDefined', true);
          } else {
            setValue('isAssistantDefined', false);
          }
          response = await retrieveServices({
            userEmail,
            serviceName: 'vision',
          });
          if (response.visionId) {
            setValue('isVisionEnabled', response.isVisionEnabled);
            setValue('visionFiles', response.visionFileList);
            setValue('isVisionDefined', true);
          } else {
            setValue('isVisionDefined', false);
          }
        } catch (error) {
          console.error('Error prefetching services:', error);
        } finally {
          setValue('isLoading', false);
        }
      }
    };

    prefetchData();
  }, [session, setValue]);

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

  const handleSpeechClick = () => {
    setIsSpeechDialogOpen(true);
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
          <MenuItem onClick={handleSpeechClick}>
            <ListItemIcon>
              <RecordVoiceOver />
            </ListItemIcon>
            Speech
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
      />

      <VisionDialog
        open={isVisionDialogOpen}
        onClose={() => setIsVisionDialogOpen(false)}
      />

      <SpeechDialog
        open={isSpeechDialogOpen}
        onClose={() => setIsSpeechDialogOpen(false)}
      />
    </>
  );
};

export default CustomizedInputBase;
