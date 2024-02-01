interface IUser {
  email: string;
  name: string;
  model: string;
  voice: string;
  description: string;
  assistantId?: string | null;
  threadId?: string | null;
  visionId?: string | null;
  ragId?: string | null;
  isAssistantEnabled: boolean;
  isVisionEnabled: boolean;
  isTextToSpeechEnabled: boolean;
  isRagEnabled: boolean;
}
