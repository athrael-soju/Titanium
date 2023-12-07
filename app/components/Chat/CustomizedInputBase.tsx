import React, { useState, useCallback, useRef } from "react";
import OpenAI from "openai";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import FileUploadIcon from "@mui/icons-material/CloudUpload";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { ChatWithVisionVariables } from "@/lib/types";
import { useChatWithVision } from "../../hooks";
import { convertFileToBase64 } from "../../utils/convertFileToBase64";

const CustomizedInputBase = ({
  onSendMessage,
}: {
  onSendMessage: (message: string | any) => void;
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatWithVision = useChatWithVision() as any;

  const [preview, setPreview] = useState<string>(""); // URL for the image preview
  const [file, setFile] = useState<File | null>(null); // Holds the selected image file
  const [base64Image, setBase64Image] = useState<string>("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (inputValue.trim()) {
        // onSendMessage(inputValue);
        setInputValue("");
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Callback for handling file selection changes
  const handleFileChange = useCallback(async (selectedFile: File) => {
    const imagePreviewUrl = URL.createObjectURL(selectedFile);
    // Updating state with the new file and its preview URL
    setFile(selectedFile);
    setPreview(imagePreviewUrl);

    // Convert the file to a base64 string and store it in the state
    const base64 = await convertFileToBase64(selectedFile);
    setBase64Image(base64);
  }, []);

  const handleSendClick = () => {
    const variables: ChatWithVisionVariables = {
      imageURL: base64Image,
      text: inputValue,
    };
    onSendMessage(variables);

    chatWithVision.mutate(variables, {
      onSuccess: (data: any) => {
        const role: OpenAI.ChatCompletionRole = "system";
        onSendMessage({
          text: data,
          role,
        });
      },
    });

    setPreview("");
    setInputValue("");
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

  return (
    <>
      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: isSmallScreen ? "100%" : 600,
        }}
        onKeyDown={handleKeyDown}
      >
        <IconButton
          sx={{ p: "10px" }}
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
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleUploadClick}>
            <ListItemIcon>
              <FileUploadIcon />
            </ListItemIcon>
            Upload File
          </MenuItem>
        </Menu>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-48 mb-5 mx-auto"
            style={{
              borderRadius: "5px",
              maxWidth: "35px",
            }}
          />
        )}
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Enter your message"
          value={inputValue}
          onChange={handleInputChange}
        />
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label="send"
          onClick={handleSendClick}
        >
          {chatWithVision?.isPending ? <CircularProgress /> : <SendIcon />}
        </IconButton>
      </Paper>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
          }
        }}
        accept="image/*"
      />
    </>
  );
};

export default CustomizedInputBase;
