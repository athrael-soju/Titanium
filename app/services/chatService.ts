import axios from 'axios';

const retrieveAIResponse = async (
  userMessage: string,
  userEmail: string,
  isAssistantEnabled: boolean
): Promise<Response | ReadableStreamDefaultReader<Uint8Array> | undefined> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, userEmail }),
    });
    if (isAssistantEnabled) {
      return response;
    } else {
      return response.body?.getReader();
    }
  } catch (error) {
    console.error('Failed to fetch AI response:', error);
    return undefined;
  }
};

const uploadFile = async (
  file: File,
  userEmail: string
): Promise<Response | undefined> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', userEmail);

    const fileUploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    return fileUploadResponse;
  } catch (error) {
    console.error('Failed to upload file:', error);
  }
};

export { retrieveAIResponse, uploadFile };
