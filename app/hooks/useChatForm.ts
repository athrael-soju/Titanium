import { useForm } from 'react-hook-form';

interface ChatFormValues {
  name: string;
  description: string;
  model: string;
  voice: string;
  isAssistantEnabled: boolean;
  isAssistantDefined: boolean;
  isVisionEnabled: boolean;
  isVisionDefined: boolean;
  isTextToSpeechEnabled: boolean;
  isSpeechToTextEnabled: boolean;
  isRagEnabled: boolean;
  transcript: string;
  isLoading: boolean;
  assistantFiles: { name: string; id: string; assistandId: string }[];
  visionFiles: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  }[];
}

export const useChatForm = () => {
  const formMethods = useForm<ChatFormValues>({
    defaultValues: {
      name: '',
      description: '',
      model: '',
      voice: '',
      isAssistantEnabled: false,
      isAssistantDefined: false,
      isVisionEnabled: false,
      isVisionDefined: false,
      isTextToSpeechEnabled: false,
      isSpeechToTextEnabled: false,
      isRagEnabled: false,
      transcript: '',
      isLoading: false,
      assistantFiles: [],
      visionFiles: [],
    },
  });

  return formMethods;
};
