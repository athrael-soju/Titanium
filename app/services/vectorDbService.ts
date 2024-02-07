const upsertToVectorDb = async (
  data: any[],
  userEmail: string,
  chunkBatch: string
): Promise<any> => {
  try {
    const response = await fetch('/api/rag/vector-db/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, userEmail, chunkBatch }),
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
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
    return jsonResponse;
  } catch (error) {
    console.error('Error deleting data from vector db:', error);
    throw new Error('Error deleting data from vector db');
  }
};

const queryVectorDbByNamespace = async (
  embeddedMessage: any,
  userEmail: string,
  topK: string
): Promise<any> => {
  try {
    const response = await fetch('/api/rag/vector-db/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail, embeddedMessage, topK }),
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    return jsonResponse;
  } catch (error) {
    console.error('Error deleting data from vector db:', error);
    throw new Error('Error deleting data from vector db');
  }
};

export { upsertToVectorDb, deleteFileFromVectorDb, queryVectorDbByNamespace };
