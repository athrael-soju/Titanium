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
import AssistantDialog from '../Assistant';
import VisionDialog from '../Vision';
import { retrieveAssistant } from '@/app/services/assistantService';
import { useSession } from 'next-auth/react';

const CustomizedInputBase = ({
  setIsLoading,
  onSendMessage,
  isAssistantEnabled,
  setIsAssistantEnabled,
  isVisionEnabled,
  setIsVisionEnabled,
}: {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSendMessage: (message: string) => void;
  isAssistantEnabled: boolean;
  setIsAssistantEnabled: (isAssistantEnabled: boolean) => void;
  isVisionEnabled: boolean;
  setIsVisionEnabled: (isVisionEnabled: boolean) => void;
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAssistantDefined, setIsAssistantDefined] = useState(false);
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = React.useState(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const files = useRef<{ name: string; id: string; assistandId: string }[]>([]);
  const updateFiles = (
    newFiles: { name: string; id: string; assistandId: string }[]
  ) => {
    files.current = newFiles;
  };
  const visionFiles = useRef<{ name: string; id: string }[]>([]);
  const updateVisionFiles = (
    newVisionFiles: { name: string; id: string }[]
  ) => {
    visionFiles.current = newVisionFiles;
  };
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
            {' '}
            {/* Add this new menu item */}
            <ListItemIcon>
              <VisionIcon fontSize="small" />{' '}
              {/* Replace with your actual Vision icon */}
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
        updateFiles={updateFiles}
      />
      <VisionDialog
        open={isVisionDialogOpen}
        onClose={() => setIsVisionDialogOpen(false)}
        isVisionEnabled={isVisionEnabled}
        setIsVisionEnabled={setIsVisionEnabled}
        setIsLoading={setIsLoading}
        visionFiles={visionFiles.current}
        updateVisionFiles={updateVisionFiles}
      />
    </>
  );
};

export default CustomizedInputBase;
