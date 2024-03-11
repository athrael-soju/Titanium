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
import FilePaper from '../../FileList';

interface TextToImageFileListProps {
  files: {
    id: string;
    textToImageId: string;
    name: string;
    type: string;
    url: string;
  }[];
  onDelete: (file: any) => void;
}

const TextToImageFileList: React.FC<TextToImageFileListProps> = ({ files, onDelete }) => {
  return (
    <div style={{ paddingTop: 5 }}>
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
    </div>
  );
};

export default TextToImageFileList;
