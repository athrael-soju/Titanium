interface RagUpdateData {
  isRagEnabled: boolean;
  userEmail: string;
  topK: string;
  chunkBatch: string;
  parsingStrategy: string;
}

const updateRag = async ({
  isRagEnabled,
  userEmail,
  topK,
  chunkBatch,
  parsingStrategy,
}: RagUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/rag/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isRagEnabled,
        userEmail,
        topK,
        chunkBatch,
        parsingStrategy,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteRagFile = async ({
  file,
  userEmail,
}: {
  file: RagFile;
  userEmail: string;
}): Promise<any> => {
  try {
    const response = await fetch('/api/rag/delete-file/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file, userEmail }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const updateFileStatus = async ({
  file,
  userEmail,
}: {
  file: RagFile;
  userEmail: string;
}): Promise<any> => {
  try {
    const response = await fetch('/api/rag/update-file-status/', {
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
    console.error('Unexpected error: ', error);
    throw new Error('Error updating file status');
  }
};

const uploadRagFile = async (file: File, userEmail: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userEmail', userEmail);
  try {
    const response = await fetch('/api/rag/upload', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

export { updateRag, deleteRagFile, updateFileStatus, uploadRagFile };
