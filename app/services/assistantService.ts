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
    // Send a GET request to the /api/assistant/retrieve endpoint
    const response = await axios.get(`/api/assistant/retrieve/`, {
      headers: { userEmail: userEmail },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateAssistant, retrieveAssistant };
