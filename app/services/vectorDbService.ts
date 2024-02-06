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
    const jsonResponse = await response.json();
    console.log('Data upserted:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Error upserting data to vector db:', error);
    throw new Error('Error upserting data to vector db');
  }
};

export { upsertToVectorDb };
