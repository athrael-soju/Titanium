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
import ProcessIcon from '@mui/icons-material/Assignment';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import FilePaper from '../FileList';

interface RagFileListProps {
  files: { name: string; id: string; ragId: string }[];
  onDelete: (file: RagFile) => void;
  onProcess: (file: RagFile) => void;
}

const RagFileList: React.FC<RagFileListProps> = ({
  files,
  onDelete,
  onProcess,
}) => {
  return (
    <FilePaper
      files={files}
      renderFileItem={(file) => (
        <ListItem key={file.id}>
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={file.name} />
          <div>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(file)}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="process"
              onClick={() => onProcess(file)}
              disabled={file.processed}
            >
              {file.processed ? <DownloadDoneIcon /> : <ProcessIcon />}
            </IconButton>
          </div>
        </ListItem>
      )}
    />
  );
};

export default RagFileList;
