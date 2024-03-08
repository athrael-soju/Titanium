import {
  appendMessageToNoSql,
  appendMessageToVector,
  augmentMessageViaNoSql,
  augmentMessageViaVector,
  updateMessageMetadataInVector,
} from '@/app/services/longTermMemoryService';

import { embedMessage } from '../services/embeddingService';

let lastMessage = {} as IMessage;

const augment = async (
  historyLength: string,
  memoryType: string,
  message: string,
  newMessage: IMessage,
  session: any
) => {
  let response;
  const userEmail = session?.user?.email as string;
  if (memoryType === 'NoSQL') {
    response = await augmentMessageViaNoSql({
      message,
      userEmail,
      historyLength,
    });
    return response.formattedConversationHistory;
  } else if (memoryType === 'Vector') {
    const embeddedMessage = await embedMessage(newMessage);
    response = await augmentMessageViaVector({
      userEmail,
      historyLength,
      embeddedMessage,
    });
    return response.formattedConversationHistory?.messages?.join('\n');
  }
};

const append = async (
  memoryType: string,
  message: IMessage,
  userEmail: string
) => {
  let response;
  if (memoryType === 'NoSQL') {
    response = await appendMessageToNoSql({
      userEmail,
      message,
    });
    console.info('Appended message to NoSql:', response);
  } else if (memoryType === 'Vector') {
    if (message.sender === 'user') {
      const embeddedMessage = await embedMessage(message);
      const vectorMessage = {
        id: message.id,
        values: embeddedMessage.values,
      };
      response = await appendMessageToVector({
        userEmail,
        vectorMessage,
      });
      lastMessage = message;
      console.info('Appended message to Vector:', response);
    } else if (message.sender === 'ai') {
      const metadata = {
        user: `Date: ${lastMessage.createdAt}. Sender: ${lastMessage.conversationId}. Message: ${lastMessage.text}`,
        ai: `Date: ${message.createdAt}. Sender: AI. Message: ${message.text}`,
      };

      const id = lastMessage.id;
      const response = await updateMessageMetadataInVector({
        userEmail,
        id,
        metadata,
      });

      lastMessage = message;
      console.info('Updated metadata in Vector:', response);
    }
  }
};

export const persistentMemoryUtils = {
  augment,
  append,
};
