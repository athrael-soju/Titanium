import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  getConversation,
  createConversation,
  updateConversationSettings,
} from '@/app/lib/utils/db';
import { pinecone } from '@/app/lib/client/pinecone';
import { sendErrorResponse } from '@/app/lib/utils/response';
import { generateEmbeddings } from '@/app/services/embeddingService';
import { queryVectorDbByNamespace } from '@/app/services/vectorDbService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const db = await getDb();
  const { userEmail, message, memoryType } = (await req.json()) as {
    userEmail: string;
    message: IMessage;
    memoryType: string;
  };
  try {
    if (memoryType === 'NoSQL') {
      const conversationCollection =
        db.collection<IConversation>('conversations');
      let { conversation } = await getConversation(db, userEmail);

      if (conversation) {
        await updateConversationSettings(
          conversation,
          conversationCollection,
          message
        );
      } else {
        conversation = {
          id: userEmail,
          messages: [message],
        } as IConversation;
        console.log('No existing conversation found. Creating...');
        await createConversation(conversation, conversationCollection);
      }
    } else if (memoryType === 'Vector') {
      const jsonMessage = [
        {
          text: message,
          metadata: {
            user_email: userEmail,
          },
        },
      ];
      const data = await generateEmbeddings(
        jsonMessage,
        userEmail,
        memoryType,
        false
      );

      const index = await pinecone.getIndex();
      await index.namespace(`history_${userEmail}`).upsert(data);
      
    }
    return NextResponse.json({
      message: `Conversation message appended via ${memoryType} database.`,
      userEmail,
      newMessage: message,
      status: 200,
    });
  } catch (error: any) {
    console.error(
      `Error appending message to ${memoryType} database: ${error}`
    );
    return sendErrorResponse(
      `Error appending message to ${memoryType} database`,
      400
    );
  }
}
