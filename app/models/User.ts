interface IUser {
  email: string;
  name: string;
  description: string;
  assistantId?: string;
  threadId?: string;
  isAssistantEnabled: boolean;
}
