import { Collection, Db } from 'mongodb';
import clientPromise from '@/app/lib/client/mongodb';

export const getDb = async (): Promise<Db> => {
  const client = await clientPromise;
  return client.db();
};

export const getUserByEmail = async (
  usersCollection: Collection<IUser>,
  email: string
): Promise<IUser | null> => {
  return usersCollection.findOne({ email });
};

export async function getDatabaseAndUser(
  db: Db,
  userEmail: string
): Promise<{ user: IUser }> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  const usersCollection = db.collection<IUser>('users');
  const user = await getUserByEmail(usersCollection, userEmail);

  if (!user) {
    throw new Error('User not found');
  }

  return { user };
}

export async function getConversation(
  db: Db,
  userEmail: string
): Promise<{ conversation: IConversation }> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  const conversationCollection = db.collection<IConversation>('conversations');
  const conversation = await getConversationByEmail(
    conversationCollection,
    userEmail
  );

  return { conversation: conversation! };
}

export const getConversationByEmail = async (
  conversationCollection: Collection<IConversation>,
  userEmail: string
): Promise<IConversation | null> => {
  return conversationCollection.findOne({ id: userEmail });
};

export async function createConversation(
  conversation: IConversation,
  conversationCollection: Collection<IConversation>
): Promise<void> {
  await conversationCollection.insertOne(conversation);
}

export async function updateConversationSettings(
  conversation: IConversation,
  conversationCollection: Collection<IConversation>,
  message: IMessage
): Promise<void> {
  await conversationCollection.updateOne(
    { id: conversation.id },
    {
      $set: {
        messages: [...conversation.messages, message],
      },
    }
  );
}

export async function updateMemorySettings(
  user: IUser,
  usersCollection: Collection<IUser>,
  isLongTermMemoryEnabled: boolean,
  memoryType: string,
  historyLength: string
): Promise<void> {
  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isLongTermMemoryEnabled: isLongTermMemoryEnabled,
        memoryType: memoryType,
        historyLength: historyLength,
      },
    }
  );
}

export async function getFormattedConversationHistory(
  historyLength: string,
  conversation: IConversation
) {
  try {
    // Check if the conversation has messages and filter out any null messages
    const messages =
      conversation.messages
        ?.filter((msg) => msg != null && msg.conversationId === conversation.id)
        ?.slice(0, parseInt(historyLength)) ?? [];
    // Filter out messages with null 'createdAt' and sort the rest by 'createdAt' in descending order
    const sortedMessages = messages
      .filter((msg) => msg.createdAt != null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    // Adjust slice to start from 0, and ensure parsing 'historyLength' to integer
    const recentMessages = sortedMessages
      .map(
        (msg) =>
          `- ${new Date(msg.createdAt).toISOString()}, ${
            msg.sender === 'user' ? 'User' : 'AI'
          }, ${msg.text}`
      )
      .join('\n');

    // Return the latest user message in the specified format
    return recentMessages;
  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    throw error; // Rethrow or handle as needed
  }
}
