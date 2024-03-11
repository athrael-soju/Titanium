interface IUser {
  email: string;
  name: string;
  model: string;
  topK: string;
  chunkSize: string;
  chunkBatch: string;
  parsingStrategy: string;
  memoryType: string;
  historyLength: string;
  voice: string;
  description: string;
  assistantId?: string | null;
  threadId?: string | null;
  textToImageId?: string | null;
  ragId?: string | null;
  isAssistantEnabled: boolean;
  isTextToImageEnabled: boolean;
  isTextToSpeechEnabled: boolean;
  isRagEnabled: boolean;
  isLongTermMemoryEnabled: boolean;
}
