import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseAndUser, getDb } from '@/app/lib/utils/db';
import { sendErrorResponse } from '@/app/lib/utils/response';
import { pinecone } from '@/app/lib/client/pinecone';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const requestBody = await req.json();
    const { embeddedMessage, userEmail, topK } = requestBody;
    const { user } = await getDatabaseAndUser(db, userEmail);

    const namespace = user.ragId;
    if (namespace) {
      const response = await pinecone.queryByNamespace(
        namespace,
        topK,
        embeddedMessage[0]
      );

      const context = response.matches
        .map((item: any) => {
          return (
            `Filename: "${item.metadata.filename}"\n` +
            `Filetype: "${item.metadata.filetype}"\n` +
            `Languages: [ ${item.metadata.languages.join(', ')} ]\n` +
            `Page Number: ${item.metadata.page_number}\n` +
            `Parent ID: "${item.metadata.parent_id}"\n` +
            `RAG ID: "${item.metadata.rag_id}"\n` +
            `Text: "${item.metadata.text}"\n` +
            `User Email: "${item.metadata.user_email}"`
          );
        })
        .join('\n\n');

      return NextResponse.json({
        message: 'Pinecone query successful',
        ragId: namespace,
        context,
        isRagEnabled: user.isRagEnabled,
        status: 200,
      });
    } else {
      return sendErrorResponse(
        'Query cannot proceed without a valid user ragId',
        400
      );
    }
  } catch (error: any) {
    console.error('Error querying Pinecone:', error);
    return sendErrorResponse('Error querying Pinecone: ', 400);
  }
}
