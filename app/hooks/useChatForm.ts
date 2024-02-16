import { useForm } from 'react-hook-form';

interface ChatFormValues {
  name: string;
  description: string;
  model: string;
  voice: string;
  topK: string;
  chunkSize: string;
  chunkBatch: string;
  parsingStrategy: string;
  memoryType: string;
  historyLength: string;
  isAssistantEnabled: boolean;
  isAssistantDefined: boolean;
  isVisionEnabled: boolean;
  isVisionDefined: boolean;
  isTextToSpeechEnabled: boolean;
  isSpeechToTextEnabled: boolean;
  isRagEnabled: boolean;
  isLongTermMemoryEnabled: boolean;
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
  ragFiles: {
    id: string;
    ragId: string;
    name: string;
    type: string;
    processed: boolean;
    chunks: string[];
  }[];
}

export const useChatForm = () => {
  const formMethods = useForm<ChatFormValues>({
    defaultValues: {
      name: '',
      description: '',
      model: '',
      voice: '',
      topK: '',
      chunkSize: '',
      chunkBatch: '',
      parsingStrategy: '',
      memoryType: '',
      historyLength: '',
      isAssistantEnabled: false,
      isAssistantDefined: false,
      isVisionEnabled: false,
      isVisionDefined: false,
      isTextToSpeechEnabled: false,
      isSpeechToTextEnabled: false,
      isRagEnabled: false,
      isLongTermMemoryEnabled: false,
      transcript: '',
      isLoading: false,
      assistantFiles: [],
      visionFiles: [],
      ragFiles: [],
    },
  });

  return formMethods;
};
