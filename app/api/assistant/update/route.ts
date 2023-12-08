import clientPromise from '../../../lib/client/mongodb';

//export const runtime = 'edge';

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db();

  try {
    const { userEmail, name, description, isActive } = await req.json();

    if (!userEmail || !name || !description || isActive === undefined) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const usersCollection = db.collection<IUser>('users');
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    let assistantId = user.assistantId;
    if (!assistantId) {
      // Logic to interact with OpenAI API. Use temporary value for now.
      // ...
      assistantId = 'assistant-456';
      // ...
      await usersCollection.updateOne(
        { email: userEmail },
        { $set: { assistantId } }
      );
    }

    return new Response('Assistant updated', { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
