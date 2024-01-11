import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';
import { retrieveServices } from '@/app/services/commonService';

interface UseCustomInputProps {
  onSendMessage: (message: string) => void;
}

export const useCustomInput = ({ onSendMessage }: UseCustomInputProps) => {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [isSpeechDialogOpen, setIsSpeechDialogOpen] = useState(false);
  const { setValue } = useFormContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const prefetchData = async () => {
      if (session) {
        try {
          setValue('isLoading', true);
          const userEmail = session.user?.email as string;
          let response = await retrieveServices({
            userEmail,
            serviceName: 'assistant',
          });
          if (response.assistant) {
            setValue('name', response.assistant.name);
            setValue('description', response.assistant.instructions);
            setValue('isAssistantEnabled', response.isAssistantEnabled);
            setValue('assistantFiles', response.fileList);
            setValue('isAssistantDefined', true);
          } else {
            setValue('isAssistantDefined', false);
          }
          response = await retrieveServices({
            userEmail,
            serviceName: 'vision',
          });
          if (response.visionId) {
            setValue('isVisionEnabled', response.isVisionEnabled);
            setValue('visionFiles', response.visionFileList);
            setValue('isVisionDefined', true);
          } else {
            setValue('isVisionDefined', false);
          }

          response = await retrieveServices({
            userEmail,
            serviceName: 'speech',
          });
          console.log('response', response);
          setValue('isSpeechEnabled', response.isSpeechEnabled);
          if (response.model) {
            setValue('model', response.model);
          }
          if (response.voice) {
            setValue('voice', response.voice);
          }
        } catch (error) {
          console.error('Error prefetching services:', error);
        } finally {
          setValue('isLoading', false);
        }
      }
    };

    prefetchData();
  }, [session, setValue]);

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

  const handleAssistantsClick = () => {
    setIsAssistantDialogOpen(true);
    handleMenuClose();
  };

  const handleVisionClick = () => {
    setIsVisionDialogOpen(true);
    handleMenuClose();
  };

  const handleSpeechClick = () => {
    setIsSpeechDialogOpen(true);
    handleMenuClose();
  };

  return {
    inputValue,
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
  };
};
