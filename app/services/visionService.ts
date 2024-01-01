import axios from 'axios';

interface VisionRetrieveData {
  userEmail: string;
}

interface VisionUpdateData {
  isVisionEnabled: boolean;
  userEmail: string;
}

interface VisionAddUrlData {
  userEmail: string;
  file: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  };
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

const deleteVisionFile = async (
  file: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  },
  userEmail: string
): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/delete-url/', {
      file,
      userEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const addVisionUrl = async ({
  userEmail,
  file,
}: VisionAddUrlData): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/add-url', {
      userEmail,
      file,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload file:', error);
  }
};

export { updateVision, deleteVisionFile, addVisionUrl };
