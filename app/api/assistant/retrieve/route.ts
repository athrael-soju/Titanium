export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    // Parse the request URL
    const url = new URL(req.url);

    // Retrieve userEmail query parameter
    const userEmail = url.searchParams.get('userEmail');
    if (!userEmail) {
      return new Response('userEmail query parameter is required', {
        status: 400,
      });
    }

    // Your logic here using userEmail
    // ...

    // Construct and return a new Response object
    return new Response(/* your response here */);
  } catch (error: any) {
    // Return an error response
    return new Response(error, { status: 500 });
  }
}
