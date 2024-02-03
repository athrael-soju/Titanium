interface RagUpdateData {
  isRagEnabled: boolean;
  userEmail: string;
}

const updateRag = async ({
  isRagEnabled,
  userEmail,
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
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
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
    console.error('Unexpected error:', error);
    throw error;
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
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateRag, deleteRagFile, uploadRagFile };
