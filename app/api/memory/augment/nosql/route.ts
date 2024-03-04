import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  getConversation,
  getFormattedConversationHistory,
} from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const db = await getDb();
  const { userEmail, message, historyLength } = await req.json();
  let formattedConversationHistory = message;
  try {
    const { conversation } = await getConversation(db, userEmail);
    if (conversation?.messages?.length > 0) {
      formattedConversationHistory = await getFormattedConversationHistory(
        historyLength,
        conversation
      );
    }
    if (!formattedConversationHistory) {
      return sendErrorResponse(
        `Error Augmenting message with NoSQL database`,
        404
      );
    }

    return NextResponse.json({
      message: `NoSQL Message augmentation successful`,
      userEmail: userEmail,
      formattedConversationHistory: formattedConversationHistory,
      status: 200,
    });
  } catch (error: any) {
    console.error(`Error Augmenting message with NoSQL database: ${error}`);
    return sendErrorResponse(
      `Error Augmenting message with NoSQL database`,
      400
    );
  }
}
