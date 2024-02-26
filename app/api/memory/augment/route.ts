import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  getConversation,
  gethistoryFromNoSql,
  getHistoryFromVector,
} from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const db = await getDb();
  const { userEmail, message, historyLength, memoryType } =
    (await req.json()) as {
      userEmail: string;
      message: string;
      historyLength: string;
      memoryType: string;
    };
  let formattedConversationHistory = message;
  try {
    if (memoryType === 'NoSQL') {
      const { conversation } = await getConversation(db, userEmail);

      formattedConversationHistory = await gethistoryFromNoSql(
        historyLength,
        conversation
      );
    } else if (memoryType === 'Vector') {
      formattedConversationHistory = await getHistoryFromVector(
        historyLength,
        message,
        userEmail,
        memoryType,
      );
    }

    if (!formattedConversationHistory) {
      return sendErrorResponse(
        `Error Augmenting message with ${memoryType} database`,
        404
      );
    }

    return NextResponse.json({
      message: `${memoryType} Message augmentation successful`,
      userEmail: userEmail,
      formattedConversationHistory: formattedConversationHistory,
      status: 200,
    });
  } catch (error: any) {
    console.error(
      `Error Augmenting message with ${memoryType} database: ${error}`
    );
    return sendErrorResponse(
      `Error Augmenting message with ${memoryType} database`,
      400
    );
  }
}
