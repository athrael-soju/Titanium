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
    console.log(jsonResponse.message);
    //console.log(jsonResponse.message, jsonResponse.ragId);
    return jsonResponse;
  } catch (error) {
    console.error('Error upserting data to vector db:', error);
    throw new Error('Error upserting data to vector db');
  }
};

const deleteFileFromVectorDb = async (
  file: RagFile,
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/rag/vector-db/delete-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file, userEmail }),
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    //console.log(jsonResponse.message, jsonResponse.ragId);
    return jsonResponse;
  } catch (error) {
    console.error('Error deleting data from vector db:', error);
    throw new Error('Error deleting data from vector db');
  }
};

export { upsertToVectorDb, deleteFileFromVectorDb };
