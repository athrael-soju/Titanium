const generateEmbeddings = async (data: JSON): Promise<any> => {
  try {
    const response = await fetch('/api/embed', {
      method: 'GET',
      headers: { data: JSON.stringify(data) },
    });

    if (!response.ok) {
      throw new Error('Error generating embeddings');
    }

    const responseData = await response.json();
    return responseData.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

export { generateEmbeddings };
