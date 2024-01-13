import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';
import { retrieveServices } from '@/app/services/commonService';

interface UseCustomInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

export const useCustomInput = ({ onSendMessage }: UseCustomInputProps) => {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [isAssistantDialogOpen, setIsAssistantDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [isSpeechDialogOpen, setIsSpeechDialogOpen] = useState(false);
  const { setValue } = useFormContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const prefetchAssistant = useCallback(
    async (userEmail: string) => {
      const response = await retrieveServices({
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
    },
    [setValue]
  );
  const prefetchVision = useCallback(
    async (userEmail: string) => {
      const response = await retrieveServices({
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
    },
    [setValue]
  );

  const prefetchSpeech = useCallback(
    async (userEmail: string) => {
      const response = await retrieveServices({
        userEmail,
        serviceName: 'speech',
      });
      setValue('isTextToSpeechEnabled', response.isTextToSpeechEnabled);
      if (response.model) {
        setValue('model', response.model);
      }
      if (response.voice) {
        setValue('voice', response.voice);
      }
    },
    [setValue]
  );

  const prefetchData = useCallback(async () => {
    try {
      setValue('isLoading', true);
      await prefetchAssistant(session?.user?.email as string);
      await prefetchVision(session?.user?.email as string);
      await prefetchSpeech(session?.user?.email as string);
    } catch (error) {
      console.error('Error prefetching services:', error);
    } finally {
      setValue('isLoading', false);
    }
  }, [
    prefetchAssistant,
    prefetchSpeech,
    prefetchVision,
    session?.user?.email,
    setValue,
  ]);

  useEffect(() => {
    prefetchData();
  }, [prefetchData]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const appendText = (text: string) => {
    console.log('Appending text:', text);
    setInputValue((prevValue) => `${prevValue} ${text}`.trim());
  };

  const handleSendClick = async () => {
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
  };
};
