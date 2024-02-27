const embedConversation = async (
  data: any,
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/embed/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, userEmail }),
    });

    if (!response.ok) {
      throw new Error('Error generating conversation embeddings');
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    return jsonResponse;
  } catch (error) {
    console.error('Error generating conversation embeddings: ', error);
    throw error;
  }
};

const embedMessage = async (
  message: string,
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/embed/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userEmail }),
    });

    if (!response.ok) {
      throw new Error('Error generating message embeddings');
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    return jsonResponse;
  } catch (error) {
    console.error('Error generating message embeddings: ', error);
    throw error;
  }
};

export { embedConversation, embedMessage };
