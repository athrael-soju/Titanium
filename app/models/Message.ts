interface IMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: Date;
  metadata?: any;
}
