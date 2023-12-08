export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    // Construct and return a new Response object
    return new Response();
  } catch (error: any) {
    // Return an error response
    return new Response(error);
  }
}
