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

export { updateRag };
