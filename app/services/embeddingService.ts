const generateEmbeddings = async (
  data: JSON,
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, userEmail }),
    });

    if (!response.ok) {
      throw new Error('Error generating embeddings');
    }
    const jsonResponse = await response.json();
    console.log('Embeddings generated:', jsonResponse.embeddings);
    return jsonResponse.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

export { generateEmbeddings };
