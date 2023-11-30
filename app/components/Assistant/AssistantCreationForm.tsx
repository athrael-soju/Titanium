import React from 'react';
import {
  TextField,
  Button,
  Paper,
  Container,
  Box,
  Typography,
} from '@mui/material';

interface Props {
  onAssistantCreate: () => void;
  isStartEnabled: boolean;
  assistantName: string;
  setAssistantName: React.Dispatch<React.SetStateAction<string>>;
  assistantDescription: string;
  setAssistantDescription: React.Dispatch<React.SetStateAction<string>>;
}

const AssistantCreationForm: React.FC<Props> = ({
  onAssistantCreate,
  isStartEnabled,
  assistantName,
  setAssistantName,
  assistantDescription,
  setAssistantDescription,
}) => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8 }}>
        <Paper elevation={6} sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
          >
            Create your Assistant
          </Typography>
          <TextField
            required
            label="Assistant Name"
            fullWidth
            margin="normal"
            variant="outlined"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
          />
          <TextField
            required
            label="Assistant Description"
            fullWidth
            margin="normal"
            variant="outlined"
            value={assistantDescription}
            onChange={(e) => setAssistantDescription(e.target.value)}
            multiline
            rows={4}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!isStartEnabled}
            onClick={onAssistantCreate}
            sx={{ mt: 2 }}
          >
            Start Chatting!
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default AssistantCreationForm;
