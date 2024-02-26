const generateEmbeddings = async (
  data: any,
  userEmail: string,
  memoryType: string,
  isRagEnabled: boolean
): Promise<any> => {
  try {
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, userEmail, memoryType, isRagEnabled }),
    });

    if (!response.ok) {
      throw new Error('Error generating embeddings');
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    return jsonResponse;
  } catch (error) {
    console.error('Error generating embeddings: ', error);
    throw error;
  }
};

export { generateEmbeddings };
