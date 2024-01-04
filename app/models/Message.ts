interface IMessage {
  text: string;
  sender: 'user' | 'ai';
  id: string;
}
