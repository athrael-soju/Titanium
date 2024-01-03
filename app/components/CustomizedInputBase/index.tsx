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
import { useFormContext } from 'react-hook-form';
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
  const [isAssistantDefined, setIsAssistantDefined] = useState(false);
  const [isVisionDefined, setIsVisionDefined] = useState(false);
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = React.useState(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const formContext = useFormContext();
  const { setValue, watch } = formContext;
  const isAssistantEnabled = watch('isAssistantEnabled');
  const isVisionEnabled = watch('isVisionEnabled');

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
            setName(response.assistant.name);
            setDescription(response.assistant.instructions);
            setValue('IsAssistantEnabled', response.isAssistantEnabled);
            files.current = response.fileList;
            setIsAssistantDefined(true);
          } else {
            setIsAssistantDefined(false);
          }
          response = await retrieveServices({
            userEmail,
            serviceName: 'vision',
          });
          if (response.visionId) {
            setValue('isVisionEnabled', response.isVisionEnabled);
            visionFiles.current = response.visionFileList;
            setIsVisionDefined(true);
          } else {
            setIsVisionDefined(false);
          }
        } catch (error) {
          console.error('Error prefetching services:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    prefetchData();
  }, [session, setIsLoading, isVisionEnabled, setValue]);

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

  const handleSetIsVisionEnabled = (value: boolean) => {
    setValue('isVisionEnabled', value);
    if (value) {
      setValue('isAssistantEnabled', false);
    }
  };

  const handleSetIsAssistantEnabled = (value: boolean) => {
    setValue('isAssistantEnabled', value);
    if (value) {
      setValue('isVisionEnabled', false);
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
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        isAssistantEnabled={isAssistantEnabled}
        setIsAssistantEnabled={handleSetIsAssistantEnabled}
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
        setIsVisionEnabled={handleSetIsVisionEnabled}
        isVisionDefined={isVisionDefined}
        setIsVisionDefined={setIsVisionDefined}
        setIsLoading={setIsLoading}
        visionFiles={visionFiles.current}
        updateVisionFiles={updateVisionFiles}
      />
    </>
  );
};

export default CustomizedInputBase;
