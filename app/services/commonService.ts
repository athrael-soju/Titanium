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
    const response = await axios.get(`/api/common/retrieve/`, {
      headers: { userEmail: userEmail, serviceName: serviceName },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { retrieveServices };
