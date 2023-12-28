import axios from 'axios';

interface VisionRetrieveData {
  userEmail: string;
}
interface VisionUpdateData {
  isVisionEnabled: boolean;
  userEmail: string;
  visionFiles: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  }[];
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
  visionFiles,
}: VisionUpdateData): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/update', {
      isVisionEnabled,
      userEmail,
      visionFiles,
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

const deleteVisionFile = async (file: {
  id: string;
  visionId: string;
  name: string;
  type: string;
  url: string;
}): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/delete-url/', {
      file,
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

export { updateVision, retrieveVision, deleteVisionFile, addVisionUrl };