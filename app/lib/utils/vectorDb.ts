import {
  RecordMetadata,
  ScoredPineconeRecord,
} from '@pinecone-database/pinecone';

interface ConversationHistory {
  messages: string[];
}

interface MetadataMatch {
  dateMatch: RegExpExecArray | null;
  messageMatch: RegExpExecArray | null;
}

const datePattern = /Date: (.*?\))./;
const messagePattern = /Message: (.*)$/;

function extractMatches(metadata: string): MetadataMatch {
  return {
    dateMatch: datePattern.exec(metadata),
    messageMatch: messagePattern.exec(metadata),
  };
}

function formatMessage(
  type: 'ai' | 'user',
  dateMatch: RegExpExecArray,
  messageMatch: RegExpExecArray
): string {
  return `- Date: ${dateMatch[1]}, Sender: ${type.toUpperCase()}, Message: ${
    messageMatch[1]
  }`;
}

function insertSorted(messages: string[], msg: string) {
  const match = datePattern.exec(msg);
  if (!match) return;

  const msgDate = new Date(match[1]);
  let i = messages.length - 1;
  while (i >= 0) {
    const currentMatch = datePattern.exec(messages[i]);
    if (!currentMatch) {
      i--;
      continue;
    }

    const currentMsgDate = new Date(currentMatch[1]);
    if (msgDate >= currentMsgDate) {
      break;
    }
    i--;
  }
  messages.splice(i + 1, 0, msg);
}

export async function getFormattedConversationHistory(
  conversationHistoryResults: ScoredPineconeRecord<RecordMetadata>[]
): Promise<ConversationHistory> {
  try {
    const messages: string[] = [];

    conversationHistoryResults.forEach((item) => {
      if (!item.metadata) return;

      const aiMetadata = item.metadata.ai as string;
      const userMetadata = item.metadata.user as string;

      const aiMatches = extractMatches(aiMetadata);
      const userMatches = extractMatches(userMetadata);

      if (aiMatches.dateMatch && aiMatches.messageMatch) {
        const aiMsg = formatMessage(
          'ai',
          aiMatches.dateMatch,
          aiMatches.messageMatch
        );
        insertSorted(messages, aiMsg);
      }

      if (userMatches.dateMatch && userMatches.messageMatch) {
        const userMsg = formatMessage(
          'user',
          userMatches.dateMatch,
          userMatches.messageMatch
        );
        insertSorted(messages, userMsg);
      }
    });
    return { messages };
  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    throw error;
  }
}
