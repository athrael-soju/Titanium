import React, { useState, useRef } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FileUploadIcon from '@mui/icons-material/CloudUpload';
import SpeechIcon from '@mui/icons-material/RecordVoiceOver';
import AssistantIcon from '@mui/icons-material/Assistant'; // Import the icon for "Assistants"
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AssistantDialog from './AssistantDialog';
import { retrieveAssistant } from '@/app/services/assistantService'; // Import the service function
import { useSession } from 'next-auth/react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
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
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    handleMenuClose();
  };

  const handleAssistantsClick = async () => {
    setIsAssistantDialogOpen(true);
    handleMenuClose();

    // Retrieve the assistant
    try {
      setIsLoading(true);
      if (session) {
        const userEmail = session.user?.email as string;
        const response = await retrieveAssistant({ userEmail });
        setName(response.assistant.name);
        setDescription(response.assistant.instructions);
        console.log('Assistant retrieved successfully', response);
      } else {
        throw new Error('No session found');
      }
    } catch (error) {
      console.error('Error retrieving assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        setIsLoading(true);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('File uploaded successfully', response);
      } catch (error) {
        console.error('Failed to upload file:', error);
      } finally {
        setIsLoading(false);
      }
    }
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
          <MenuItem onClick={handleUploadClick}>
            <ListItemIcon>
              <FileUploadIcon />
            </ListItemIcon>
            Upload File
          </MenuItem>
          <MenuItem onClick={handleAssistantsClick}>
            <ListItemIcon>
              <AssistantIcon />
            </ListItemIcon>
            Personal Assistant
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SpeechIcon />
            </ListItemIcon>
            Web Speech
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

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <AssistantDialog
        open={isAssistantDialogOpen}
        onClose={() => setIsAssistantDialogOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default CustomizedInputBase;
