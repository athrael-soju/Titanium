import { NextRequest, NextResponse } from 'next/server';
import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userEmail, message, historyLength } = await req.json();
  let formattedConversationHistory = message;
  try {
    //TODO: Implement Vector database augment logic here
    console.log('Vector database augment logic not implemented yet.');
    return NextResponse.json({
      message: `Vector Message augmentation successful`,
      userEmail: userEmail,
      formattedConversationHistory: formattedConversationHistory,
      status: 200,
    });
  } catch (error: any) {
    console.error(`Error Augmenting message with Vector database: ${error}`);
    return sendErrorResponse(
      `Error Augmenting message with Vector database`,
      400
    );
  }
}
