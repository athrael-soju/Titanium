import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  getConversation,
  getFormattedConversationHistory,
} from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { userEmail, message, historyLength } = (await req.json()) as {
      userEmail: string;
      message: string;
      historyLength: string;
    };

    const { conversation } = await getConversation(db, userEmail);

    const formattedConversationHistory = await getFormattedConversationHistory(
      message,
      historyLength,
      conversation
    );
    if (!formattedConversationHistory) {
      return sendErrorResponse('Message augmentation unsuccessful', 404);
    }

    return NextResponse.json({
      message: 'Message augmentation successful',
      userEmail: userEmail,
      formattedConversationHistory: formattedConversationHistory,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error Augmenting message: ', error);
    return sendErrorResponse('Error Augmenting message', 500);
  }
}
