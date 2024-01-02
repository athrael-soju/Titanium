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
    const response = await fetch(`/api/${apiRoute}/retrieve/`, {
      method: 'GET',
      headers: { userEmail: userEmail, serviceName: serviceName },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { retrieveServices };
