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
  let appendMessageToConversationResponse;
  if (memoryType === 'NoSQL') {
    appendMessageToConversationResponse = await appendMessageToNoSql({
      userEmail,
      message,
    });
    console.log(
      'appendMessageToConversationResponse: ',
      appendMessageToConversationResponse
    );
  } else if (memoryType === 'Vector') {
    if (message.sender === 'user') {
      const embeddedMessage = await embedMessage(message);
      const vectorMessage = {
        id: message.id,
        values: embeddedMessage.embeddings,
      };
      appendMessageToConversationResponse = await appendMessageToVector({
        userEmail,
        vectorMessage,
      });
      lastMessage = message;
      console.log(
        'appendMessageToConversationResponse: ',
        appendMessageToConversationResponse
      );
    } else if (message.sender === 'ai') {
      const metadata = {
        user: `Date: ${lastMessage.createdAt}. Sender: ${lastMessage.conversationId}. Message: ${lastMessage.text}`,
        ai: `Date: ${message.createdAt}. Sender: AI. Message: ${message.text}`,
      };

      const id = lastMessage.id;
      const updateMessageMetadataInVectorResponse =
        await updateMessageMetadataInVector({
          userEmail,
          id,
          metadata,
        });

      lastMessage = message;
      console.log(
        'updateMessageMetadataInVectorResponse: ',
        updateMessageMetadataInVectorResponse
      );
    }
  }
};

export const persistentMemoryUtils = {
  augment,
  append,
};
