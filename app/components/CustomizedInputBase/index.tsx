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
import { useCustomInput } from '@/app/hooks/useCustomInput';
import AssistantDialog from '../Assistant';
import VisionDialog from '../Vision';
import SpeechDialog from '../Speech';
import { Microphone } from '../Speech/stt';

const CustomizedInputBase = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => Promise<void>;
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    inputValue,
    appendText,
    handleInputChange,
    handleSendClick,
    isAssistantDialogOpen,
    isVisionDialogOpen,
    isSpeechDialogOpen,
    handleAssistantsClick,
    handleVisionClick,
    handleSpeechClick,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    setIsAssistantDialogOpen,
    setIsVisionDialogOpen,
    setIsSpeechDialogOpen,
  } = useCustomInput({ onSendMessage });

  return (
    <>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: isSmallScreen ? '100%' : 650,
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSendClick();
          }
        }}
      >
        <Microphone onAppendText={appendText} />
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
            vertical: 'top',
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
              <VisionIcon fontSize="small" />
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
