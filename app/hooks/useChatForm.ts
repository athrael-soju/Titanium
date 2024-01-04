import { useForm } from 'react-hook-form';

interface ChatFormValues {
  name: string;
  description: string;
  isAssistantEnabled: boolean;
  isAssistantDefined: boolean;
  isVisionEnabled: boolean;
  isVisionDefined: boolean;
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
      isAssistantEnabled: false,
      isAssistantDefined: false,
      isVisionEnabled: false,
      isVisionDefined: false,
      isLoading: false,
      assistantFiles: [],
      visionFiles: [],
    },
  });

  return formMethods;
};
