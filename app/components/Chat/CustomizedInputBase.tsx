import React, { useState, useRef, useEffect } from 'react';
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
import AssistantIcon from '@mui/icons-material/Assistant';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AssistantDialog from '../Assistant/AssistantDialog';
import { retrieveAssistant } from '@/app/services/assistantService';
import { uploadFile } from '@/app/services/chatService';
import { useSession } from 'next-auth/react';

const CustomizedInputBase = ({
  setIsLoading,
  onSendMessage,
  isAssistantEnabled,
  setIsAssistantEnabled,
}: {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSendMessage: (message: string) => void;
  isAssistantEnabled: boolean;
  setIsAssistantEnabled: (isAssistantEnabled: boolean) => void;
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAssistantDefined, setIsAssistantDefined] = useState(false);
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const files = useRef<{ name: string; id: string; assistandId: string }[]>([]);

  useEffect(() => {
    const prefetchAssistantData = async () => {
      if (session) {
        try {
          setIsLoading(true);
          const userEmail = session.user?.email as string;
          const response = await retrieveAssistant({ userEmail });
          if (response.assistant) {
            setName(response.assistant.name);
            setDescription(response.assistant.instructions);
            setIsAssistantEnabled(response.isAssistantEnabled);
            files.current = response.fileList;
            setIsAssistantDefined(true);
          } else {
            setIsAssistantDefined(false);
          }
        } catch (error) {
          console.error('Error prefetching assistant:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    prefetchAssistantData();
  }, [session, setIsAssistantEnabled, setIsLoading]);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    handleMenuClose();
  };

  const handleAssistantsClick = async () => {
    setIsAssistantDialogOpen(true);
    handleMenuClose();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const userEmail = session?.user?.email as string;
      try {
        setIsLoading(true);
        const fileUploadResponse = await uploadFile(file, userEmail);
        const retrieveAssistantResponse = await retrieveAssistant({
          userEmail,
        });
        if (retrieveAssistantResponse.assistant) {
          files.current = retrieveAssistantResponse.fileList;
        }
        if (fileUploadResponse?.status === 200) {
          console.log('File uploaded successfully', fileUploadResponse);
        }
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
            Assistant
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
        isAssistantEnabled={isAssistantEnabled}
        setIsAssistantEnabled={setIsAssistantEnabled}
        isAssistantDefined={isAssistantDefined}
        setIsAssistantDefined={setIsAssistantDefined}
        setIsLoading={setIsLoading}
        files={files.current}
      />
    </>
  );
};

export default CustomizedInputBase;
