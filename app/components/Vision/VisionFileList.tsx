// VisionFileList.js
import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import FilePaper from '../FileList';

interface VisionFileListProps {
  files: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  }[];
  onDelete: (file: any) => void;
}

const VisionFileList: React.FC<VisionFileListProps> = ({ files, onDelete }) => (
  <FilePaper
    files={files}
    renderFileItem={(file) => (
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
    )}
  />
);

export default VisionFileList;
