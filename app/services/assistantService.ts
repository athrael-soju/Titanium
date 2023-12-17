import axios from 'axios';

interface AssistantUpdateData {
  name: string;
  description: string;
  isAssistantEnabled: boolean;
  userEmail: string;
}

interface AssistantRetrieveData {
  userEmail: string;
}

const updateAssistant = async ({
  name,
  description,
  isAssistantEnabled,
  userEmail,
}: AssistantUpdateData): Promise<any> => {
  try {
    const response = await axios.post('/api/assistant/update', {
      name,
      description,
      isAssistantEnabled,
      userEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};
const retrieveAssistant = async ({
  userEmail,
}: AssistantRetrieveData): Promise<any> => {
  try {
    const response = await axios.get(`/api/assistant/retrieve/`, {
      headers: { userEmail: userEmail },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const deleteAssistantFile = async ({
  file,
}: {
  file: string;
}): Promise<any> => {
  try {
    const response = await axios.post('/api/assistant/delete-file', {
      file,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const deleteAssistant = async ({
  userEmail,
}: AssistantRetrieveData): Promise<any> => {
  try {
    const response = await axios.post('/api/assistant/delete', {
      userEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
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

export {
  updateAssistant,
  retrieveAssistant,
  deleteAssistantFile,
  deleteAssistant,
  uploadFile,
};
