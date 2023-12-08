export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Parse the request body as JSON
    const requestBody = await req.json();

    // Extract parameters from the request body
    const { name, description, isActive } = requestBody;
    // Validate the required parameters
    if (!name || !description || isActive === undefined) {
      return new Response('Missing required parameters', { status: 400 });
    }

    // Your logic here using the extracted parameters
    // ...

    // Construct and return a successful Response object
    return new Response(JSON.stringify({ message: 'Success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // Return an error response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
