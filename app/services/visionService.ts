import axios from 'axios';

interface VisionUpdateData {
  isVisionEnabled: boolean;
  userEmail: string;
  visionFiles: { name: string; id: string; visionId: string }[];
}

interface VisionRetrieveData {
  userEmail: string;
}

const updateVision = async ({
  isVisionEnabled,
  userEmail,
}: VisionUpdateData): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/update', {
      isVisionEnabled,
      userEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const retrieveVision = async ({
  userEmail,
}: VisionRetrieveData): Promise<any> => {
  try {
    const response = await axios.get(`/api/vision/retrieve/`, {
      headers: { userEmail: userEmail },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const deleteVisionFile = async ({ file }: { file: string }): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/delete-file', {
      file,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateVision, retrieveVision, deleteVisionFile };
