const retrieveAIResponse = async (
  userMessage: string,
  userEmail: string,
  isAssistantEnabled: boolean,
  isVisionEnabled: boolean
): Promise<Response | ReadableStreamDefaultReader<Uint8Array> | undefined> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, userEmail }),
    });
    if (isAssistantEnabled) {
      return response;
    } else if (isVisionEnabled) {
      return response.body?.getReader();
    } else {
      return response.body?.getReader();
    }
  } catch (error) {
    console.error('Failed to fetch AI response:', error);
    return undefined;
  }
};

export { retrieveAIResponse };