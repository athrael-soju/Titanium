const upsertToVectorDb = async (
  data: any[],
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/rag/vector-db/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, userEmail }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { upsertToVectorDb };
