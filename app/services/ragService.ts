interface RagUpdateData {
  isRagEnabled: boolean;
  userEmail: string;
  //   model: string;
  //   voice: string;
}

const updateRag = async ({
  isRagEnabled,
  userEmail,
}: //   model,
//   voice,
RagUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/speech/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isRagEnabled,
        userEmail,
        // model,
        // voice,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateRag };
