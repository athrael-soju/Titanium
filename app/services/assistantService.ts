import axios from 'axios';

interface AssistantUpdateData {
  name: string;
  description: string;
  isActive: boolean;
  userEmail: string;
}

interface AssistantRetrieveData {
  userEmail: string;
}

const updateAssistant = async ({
  name,
  description,
  isActive,
  userEmail,
}: AssistantUpdateData): Promise<any> => {
  try {
    const response = await axios.post('/api/assistant/update', {
      name,
      description,
      isActive,
      userEmail,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error with Axios request:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
const retrieveAssistant = async ({
  userEmail,
}: AssistantRetrieveData): Promise<any> => {
  try {
    // Example: Passing session as a header
    const response = await axios.get(`/api/assistant/retrieve/`, {
      params: { userEmail },
    });
    return response.data;
  } catch (error) {
    // ...error handling...
  }
};

export { updateAssistant, retrieveAssistant };
