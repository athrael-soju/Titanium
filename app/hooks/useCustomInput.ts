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
  const [isRagDialogOpen, setIsRagDialogOpen] = useState(false);
  const { setValue } = useFormContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const prefetchServices = useCallback(
    async (userEmail: string) => {
      // Prefetch assistant data
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
      // Prefetch vision data
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
      // Prefetch speech data
      response = await retrieveServices({
        userEmail,
        serviceName: 'speech',
      });
      if (response.isTextToSpeechEnabled !== undefined) {
        setValue('isTextToSpeechEnabled', response.isTextToSpeechEnabled);
        setValue('model', response.model);
        setValue('voice', response.voice);
      }
      // Prefetch rag data
      response = await retrieveServices({
        userEmail,
        serviceName: 'rag',
      });
      if (response.ragId) {
        setValue('isRagEnabled', response.isRagEnabled);
        setValue('ragFiles', response.ragFileList);
        setValue('topK', response.topK);
        setValue('chunkBatch', response.chunkBatch);
        setValue('parsingStrategy', response.parsingStrategy);
      }
    },
    [setValue]
  );

  const prefetchData = useCallback(async () => {
    try {
      setValue('isLoading', true);
      await prefetchServices(session?.user?.email as string);
    } catch (error) {
      console.error('Error prefetching services: ', error);
    } finally {
      setValue('isLoading', false);
    }
  }, [prefetchServices, session?.user?.email, setValue]);

  useEffect(() => {
    prefetchData();
  }, [prefetchData]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const appendText = (text: string) => {
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

  const handleRagClick = () => {
    setIsRagDialogOpen(true);
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
    isRagDialogOpen,
    handleAssistantsClick,
    handleVisionClick,
    handleSpeechClick,
    handleRagClick,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    setIsAssistantDialogOpen,
    setIsVisionDialogOpen,
    setIsSpeechDialogOpen,
    setIsRagDialogOpen,
  };
};
