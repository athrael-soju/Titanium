import { NextRequest, NextResponse } from 'next/server';

import { sendErrorResponse } from '@/app/lib/utils/response';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userEmail, message } = (await req.json()) as {
    userEmail: string;
    message: IMessage;
  };
  try {
    //TODO: Implement Vector database append logic here
    console.log('Vector database append logic not implemented yet.');
    return NextResponse.json({
      message: `Conversation message appended via Vector database.`,
      userEmail,
      newMessage: message,
      status: 200,
    });
  } catch (error: any) {
    console.error(`Error appending message to Vector database: ${error}`);
    return sendErrorResponse(`Error appending message to Vector database`, 400);
  }
}
