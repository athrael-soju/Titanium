import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

interface FileListProps {
  files: { name: string; id: string; assistandId: string }[];
  onDelete: (file: any) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete }) => (
  <Paper variant="outlined" sx={{ padding: 2, marginBottom: 2 }}>
    <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
      Attached Files
    </Typography>
    <Box sx={{ height: '160px', overflowY: 'auto' }}>
      <List dense>
        {files.map((file) => (
          <ListItem
            key={file.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDelete(file)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={file.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  </Paper>
);

export default FileList;
