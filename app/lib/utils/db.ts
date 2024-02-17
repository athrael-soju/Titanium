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

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  return { conversation };
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
