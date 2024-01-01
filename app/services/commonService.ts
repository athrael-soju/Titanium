import axios from 'axios';

interface RetrieveServicesData {
  userEmail: string;
  serviceName: string;
}

const retrieveServices = async ({
  userEmail,
  serviceName,
}: RetrieveServicesData): Promise<any> => {
  try {
    let apiRoute = serviceName === 'vision' ? 'vision' : 'assistant';
    const response = await axios.get(`/api/${apiRoute}/retrieve/`, {
      headers: { userEmail: userEmail, serviceName: serviceName },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { retrieveServices };
