interface IUser {
  email: string;
  name: string;
  description: string;
  assistantId?: string | null;
  threadId?: string | null;
  isAssistantEnabled: boolean;
}
