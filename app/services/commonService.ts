import axios from 'axios';

interface retrieveServicesData {
  userEmail: string;
}

const retrieveServices = async ({
  userEmail,
}: retrieveServicesData): Promise<any> => {
  try {
    const response = await axios.get(`/api/common/retrieve/`, {
      headers: { userEmail: userEmail },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { retrieveServices };
